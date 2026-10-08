"""Portable tests for schema boundaries, escaping, and publication behavior."""
from contextlib import redirect_stdout
import copy
import io
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
import build_resume as resume
import yaml


class ResumeTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='resume test ')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        shutil.copytree(resume.ROOT / 'content', self.root / 'content')
        for name in ('latex', 'templates'):
            shutil.copytree(resume.ROOT / 'resume' / name, self.root / 'resume' / name)
        shutil.copyfile(resume.ROOT / 'resume/resume.schema.json', self.root / 'resume/resume.schema.json')
        self.data, self.options = resume.load_and_validate(self.root)
        self.schema = json.loads((self.root / 'resume/resume.schema.json').read_text())

    def save(self, name, data):
        (self.root / name).write_text(yaml.safe_dump(data, sort_keys=False), encoding='utf-8')

    def assert_invalid(self, data, path):
        with self.assertRaisesRegex(resume.BuildError, path):
            resume.validation_errors(data, self.schema, 'content')

    def test_invalid_month_and_schema_version(self):
        for value in ('2025-00', '2025-13', 'May 2025', '2025-5', '2025-05\n'):
            data = copy.deepcopy(self.data)
            data['experience'][0]['startDate'] = value
            self.assert_invalid(data, r'experience.0.startDate')
        data = copy.deepcopy(self.data)
        data['schemaVersion'] = '2.0.0'
        self.assert_invalid(data, 'schemaVersion')

    def test_unknown_fields_are_errors(self):
        data = copy.deepcopy(self.data)
        data['experience'][0]['startdate'] = '2025-05'
        self.assert_invalid(data, 'startdate')

    def test_missing_contact_detail_is_error(self):
        data = copy.deepcopy(self.data)
        del data['profile']['email']
        self.assert_invalid(data, 'email')

    def test_content_rejects_latex_commands(self):
        data = copy.deepcopy(self.data)
        data['projects'][0]['description'][0]['text'] = r'Hello \input{secret}'
        self.assert_invalid(data, r'projects.0.description.0.text')

    def test_links_reject_non_web_urls_and_spaces(self):
        for url in ('javascript:alert(1)', 'file:///secret', 'https://example.com/a b', r'https://example.com/\input'):
            data = copy.deepcopy(self.data)
            data['profile']['links']['linkedin']['url'] = url
            self.assert_invalid(data, 'url')

    def test_end_date_cannot_precede_start(self):
        data = copy.deepcopy(self.data['experience'])
        data[0]['endDate'] = '2020-01'
        self.save('content/experience.yaml', data)
        with self.assertRaisesRegex(resume.BuildError, 'must not precede'):
            resume.load_and_validate(self.root)

    def test_ongoing_and_unknown_dates(self):
        self.assertEqual(resume.date_range({'startDate': '2025-05', 'endDate': None}), 'May 2025 - Present')
        self.assertEqual(resume.date_range({'startDate': None, 'endDate': None}), '')
        self.assertEqual(resume.date_range({'startDate': '2022-11', 'endDate': '2025-02'}), 'Nov 2022 - Feb 2025')

    def test_null_or_omitted_education_honors(self):
        for omitted in (False, True):
            data = copy.deepcopy(self.data)
            entry = data['education'][0]
            if omitted:
                entry.pop('honors', None)
            else:
                entry['honors'] = None
            entry['gpa'] = None
            entry['startDate'] = entry['endDate'] = None
            resume.validation_errors(data, self.schema, 'content')
            rendered = resume.render_latex(data, self.options, self.root)
            self.assertIn(r'\datedexperience{' + resume.tex_escape(entry['degree']) + '}{}', rendered)
            self.assertNotIn('None', rendered)

    def test_optional_education_gpa_on_right_with_dates(self):
        for dates in (False, True):
            data = copy.deepcopy(self.data)
            entry = data['education'][0]
            entry['gpa'] = '3.8/4.0'
            entry['startDate'] = '2018-09' if dates else None
            entry['endDate'] = '2022-06' if dates else None
            resume.validation_errors(data, self.schema, 'content')
            rendered = resume.render_latex(data, self.options, self.root)
            right = r'Sep 2018 - Jun 2022 \cpshalf GPA: 3.8/4.0' if dates else 'GPA: 3.8/4.0'
            self.assertIn('}{' + right + '}', rendered)

    def test_null_or_omitted_gpa_does_not_render_label(self):
        for omitted in (False, True):
            data = copy.deepcopy(self.data)
            if omitted:
                data['education'][0].pop('gpa', None)
            else:
                data['education'][0]['gpa'] = None
            resume.validation_errors(data, self.schema, 'content')
            self.assertNotIn('GPA:', resume.render_latex(data, self.options, self.root))

    def test_gpa_validation_and_escaping(self):
        data = copy.deepcopy(self.data)
        data['education'][0]['gpa'] = '3.8/4.0 & top 5%'
        resume.validation_errors(data, self.schema, 'content')
        self.assertIn(r'GPA: 3.8/4.0 \& top 5\%', resume.render_latex(data, self.options, self.root))
        for value in ('', 3.8, True, {'value': '3.8'}, r'\textbf{4.0}'):
            data['education'][0]['gpa'] = value
            self.assert_invalid(data, 'education.0.gpa')

    def test_optional_interests_file(self):
        (self.root / 'content/interests.yaml').unlink()
        data, _ = resume.load_and_validate(self.root)
        self.assertEqual(data['interests'], [])

    def test_required_section_file_error(self):
        (self.root / 'content/profile.yaml').unlink()
        with self.assertRaisesRegex(resume.BuildError, 'profile.yaml'):
            resume.load_and_validate(self.root)

    def test_duplicate_yaml_keys_and_invalid_yaml(self):
        path = self.root / 'content/profile.yaml'
        path.write_text('email: first@example.com\nemail: second@example.com\n')
        with self.assertRaisesRegex(resume.BuildError, 'Duplicate YAML key.*line 2'):
            resume.load_and_validate(self.root)
        path.write_text('name: [unterminated')
        with self.assertRaisesRegex(resume.BuildError, 'profile.yaml'):
            resume.load_and_validate(self.root)

    def test_duplicate_skill_ids(self):
        data = copy.deepcopy(self.data['skills'])
        data[1]['id'] = data[0]['id']
        self.save('content/skills.yaml', data)
        with self.assertRaisesRegex(resume.BuildError, 'ids must be unique'):
            resume.load_and_validate(self.root)

    def test_boolean_options_and_safe_theme(self):
        for key, value in [('automation', 'false'), ('automation', 1), ('theme', {'color': r'Blue}\input{secret'})]:
            options = copy.deepcopy(self.options)
            options[key] = value
            self.save('content/options.yaml', options)
            with self.assertRaisesRegex(resume.BuildError, 'content.options'):
                resume.load_and_validate(self.root)

    def test_miscellaneous_header_text_and_visibility(self):
        for enabled in (False, True):
            data = copy.deepcopy(self.data)
            data['profile']['miscellaneous'] = {'text': 'Available & 100% remote', 'show': enabled}
            resume.validation_errors(data, self.schema, 'content')
            rendered = resume.render_latex(data, self.options, self.root)
            self.assertIn(r'\setmiscellaneous{Available \& 100\% remote}', rendered)
            self.assertIn(r'\miscellaneoustrue' if enabled else r'\miscellaneousfalse', rendered)
            self.assertNotIn(r'\miscellaneousfalse' if enabled else r'\miscellaneoustrue', rendered)
        for value in ('false', 0, None):
            data = copy.deepcopy(self.data)
            data['profile']['miscellaneous']['show'] = value
            self.assert_invalid(data, 'profile.miscellaneous.show')
        data = copy.deepcopy(self.data)
        data['profile']['citizenship'] = 'legacy field'
        self.assert_invalid(data, 'citizenship')

    def test_header_link_visibility_is_controlled_by_nested_profile_flags(self):
        for linkedin in (False, True):
            for github in (False, True):
                data = copy.deepcopy(self.data)
                data['profile']['links']['linkedin']['show'] = linkedin
                data['profile']['links']['github']['show'] = github
                resume.validation_errors(data, self.schema, 'content')
                rendered = resume.render_latex(data, self.options, self.root)
                for name, enabled in [('linkedin', linkedin), ('github', github)]:
                    self.assertIn('\\' + name + ('true' if enabled else 'false'), rendered)
                    self.assertNotIn('\\' + name + ('false' if enabled else 'true'), rendered)
                    self.assertEqual(data['profile']['links'][name]['url'], self.data['profile']['links'][name]['url'])
        for name in ('linkedin', 'github'):
            for value in ('false', 0, None):
                data = copy.deepcopy(self.data)
                data['profile']['links'][name]['show'] = value
                self.assert_invalid(data, 'profile.links.' + name + '.show')
            data = copy.deepcopy(self.data)
            del data['profile']['links'][name]['show']
            self.assert_invalid(data, 'show')

    def test_recursive_bullets_and_order(self):
        data = copy.deepcopy(self.data)
        data['experience'][0]['bullets'] = [
            {'runs': [{'text': 'parent'}], 'children': [
                {'runs': [{'text': 'child'}], 'children': [{'runs': [{'text': 'grandchild'}]}]}]},
            {'runs': [{'text': 'next sibling'}]}]
        resume.validation_errors(data, self.schema, 'content')
        rendered = resume.render_latex(data, self.options, self.root)
        self.assertIn(r'\nestedbullet{2}', rendered)
        self.assertLess(rendered.index('grandchild'), rendered.index('next sibling'))

    def test_empty_nested_bullet_is_invalid(self):
        data = copy.deepcopy(self.data)
        data['experience'][0]['bullets'][0]['children'] = [{'runs': []}]
        self.assert_invalid(data, 'children.0.runs')

    def test_every_tex_special_character_is_escaped_once(self):
        self.assertEqual(resume.tex_escape('\\&%$#_{}~^'),
                         r'\textbackslash{}\&\%\$\#\_\{\}\textasciitilde{}\textasciicircum{}')
        self.assertEqual(resume.tex_escape('C# & >$5m — café'), r'C\# \& >\$5m — café')

    def test_url_query_fragment_percent_and_underscore(self):
        self.assertEqual(resume.url_escape('https://example.com/a_b?q=1&x=50%25#part'),
                         r'https://example.com/a\_b?q=1\&x=50\%25\#part')
        self.assertEqual(resume.url_escape('https://example.com/é'), r'https://example.com/\%C3\%A9')

    def test_links_and_spaces_are_preserved_in_runs(self):
        data = copy.deepcopy(self.data)
        data['projects'][0]['description'] = [{'text': 'Before & '}, {'text': 'site', 'url': 'https://example.com/?a=1&b=2'}, {'text': ' after.'}]
        rendered = resume.render_latex(data, self.options, self.root)
        self.assertIn(r'Before \& \href{https://example.com/?a=1\&b=2}{site} after.', rendered)

    def test_visibility_does_not_remove_exported_content(self):
        options = copy.deepcopy(self.options)
        options['sections'] = dict.fromkeys(options['sections'], False)
        rendered = resume.render_latex(self.data, options, self.root)
        self.assertNotIn(r'\section{', rendered)
        options['sections']['interests'] = True
        options['automation'] = True
        self.data['profile']['links']['github']['show'] = True
        options['sections']['skills'] = True
        rendered = resume.render_latex(self.data, options, self.root)
        self.assertIn(r'Robotics \& Automation', rendered)
        self.assertIn(r'\section{Interests}', rendered)
        self.assertIn(r'\githubtrue', rendered)
        self.assertTrue(self.data['interests'])

    def test_explicit_section_and_entry_order(self):
        (self.root / 'content/ignored.yaml').write_text('invalid: [')
        data, _ = resume.load_and_validate(self.root)
        self.assertEqual(list(data)[2:], list(resume.SECTION_ORDER))
        self.assertEqual(data['experience'], self.data['experience'])

    def test_validation_failure_preserves_all_outputs(self):
        for name in ('resume/output/resume.json', 'resume/output/latex/cv.tex', 'resume/output/latex/muratcan_cv.cls', 'resume/output/cv.pdf'):
            (self.root / name).parent.mkdir(parents=True, exist_ok=True)
            (self.root / name).write_bytes(b'previous output')
        self.save('content/experience.yaml', [{'invalid': 'entry'}])
        with self.assertRaises(resume.BuildError):
            resume.build(self.root)
        for name in ('resume/output/resume.json', 'resume/output/latex/cv.tex', 'resume/output/latex/muratcan_cv.cls', 'resume/output/cv.pdf'):
            self.assertEqual((self.root / name).read_bytes(), b'previous output')

    def test_validate_only_does_not_write(self):
        with redirect_stdout(io.StringIO()):
            resume.build(self.root, validate_only=True)
        self.assertFalse((self.root / 'resume/output/resume.json').exists())
        self.assertFalse((self.root / 'resume/build').exists())

    def test_compiler_failure_preserves_published_pdf_and_ignores_stale_pdf(self):
        (self.root / 'resume/output').mkdir()
        (self.root / 'resume/output/cv.pdf').write_bytes(b'previous PDF')
        (self.root / 'resume/build').mkdir()
        (self.root / 'resume/build/cv.pdf').write_bytes(b'%PDF-stale')
        failed = subprocess.CompletedProcess([], 1, 'fatal TeX error', '')
        with patch.object(resume, 'find_xelatex', return_value='xelatex'), patch.object(resume.subprocess, 'run', return_value=failed):
            with self.assertRaisesRegex(resume.BuildError, 'fatal TeX error'):
                resume.build(self.root)
        self.assertEqual((self.root / 'resume/output/cv.pdf').read_bytes(), b'previous PDF')
        self.assertFalse((self.root / 'resume/build/cv.pdf').exists())
        self.assertFalse((self.root / 'resume/build/.resume-build.lock').exists())

    def test_successful_compiler_runs_twice_with_correct_paths(self):
        def compile_command(command, **kwargs):
            self.assertEqual(kwargs['cwd'], self.root / 'resume/output/latex')
            self.assertIn(f'-output-directory={self.root / "resume/build"}', command)
            (self.root / 'resume/build/cv.pdf').write_bytes(b'%PDF-new')
            return subprocess.CompletedProcess(command, 0, '', '')
        with patch.object(resume, 'find_xelatex', return_value='xelatex'), patch.object(resume.subprocess, 'run', side_effect=compile_command) as compiler, redirect_stdout(io.StringIO()):
            resume.build(self.root)
        self.assertEqual(compiler.call_count, 2)
        self.assertEqual((self.root / 'resume/output/cv.pdf').read_bytes(), b'%PDF-new')
        exported = json.loads((self.root / 'resume/output/resume.json').read_text(encoding='utf-8'))
        self.assertEqual(exported, self.data)
        self.assertNotIn('options', exported)
        self.assertIn('GENERATED', (self.root / 'resume/output/latex/cv.tex').read_text())

    def test_no_pdf_exports_portable_latex_and_copied_class(self):
        with redirect_stdout(io.StringIO()), patch.object(resume, 'find_xelatex', side_effect=AssertionError('compiler should not run')):
            resume.build(self.root, no_pdf=True)
        self.assertFalse((self.root / 'resume/output/cv.pdf').exists())
        source = (self.root / 'resume/latex/muratcan_cv.cls').read_text(encoding='utf-8')
        copied = (self.root / 'resume/output/latex/muratcan_cv.cls').read_text(encoding='utf-8')
        self.assertTrue(copied.startswith('% GENERATED COPY'))
        self.assertEqual(copied.split('\n', 1)[1], source)
        state = resume.watched_state(self.root)
        (self.root / 'resume/output/latex/muratcan_cv.cls').write_text('output edit')
        (self.root / 'resume/output/latex/cv.tex').write_text('output edit')
        self.assertEqual(resume.watched_state(self.root), state)
        (self.root / 'resume/latex/muratcan_cv.cls').write_text(source + '\n')
        with redirect_stdout(io.StringIO()):
            resume.build(self.root, no_pdf=True)
        self.assertEqual((self.root / 'resume/output/latex/muratcan_cv.cls').read_text().split('\n', 1)[1], source + '\n')

    def test_watch_detects_changes_and_optional_file_deletion(self):
        state = resume.watched_state(self.root)
        for path in ('content/profile.yaml', 'content/options.yaml', 'resume/templates/cv.tex.j2', 'resume/latex/muratcan_cv.cls'):
            target = self.root / path
            target.write_bytes(target.read_bytes() + b'\n')
            current = resume.watched_state(self.root)
            self.assertNotEqual(current, state)
            state = current
        partial = self.root / 'resume/templates/partials/header.tex.j2'
        partial.parent.mkdir()
        partial.write_text('header partial')
        current = resume.watched_state(self.root)
        self.assertNotEqual(current, state)
        partial.unlink()
        self.assertEqual(resume.watched_state(self.root), state)
        (self.root / 'content/interests.yaml').unlink()
        self.assertNotEqual(resume.watched_state(self.root), state)

    def test_watch_recovers_after_validation_error(self):
        (self.root / 'resume/scripts').mkdir()
        shutil.copyfile(resume.ROOT / 'resume/scripts/build_resume.py', self.root / 'resume/scripts/build_resume.py')
        log = self.root / 'watch.log'
        with log.open('w') as output:
            process = subprocess.Popen([sys.executable, str(self.root / 'resume/scripts/build_resume.py'), '--watch', '--no-pdf'],
                                       cwd=self.root, stdout=output, stderr=subprocess.STDOUT)
            try:
                def wait_for(predicate):
                    deadline = time.monotonic() + 10
                    while time.monotonic() < deadline:
                        text = log.read_text(encoding='utf-8')
                        if predicate(text):
                            return
                        self.assertIsNone(process.poll(), text)
                        time.sleep(0.1)
                    self.fail('Watcher did not respond: ' + log.read_text())
                wait_for(lambda text: 'Generated resume/output/resume.json' in text)
                before = (self.root / 'resume/output/resume.json').read_bytes()
                self.save('content/options.yaml', {'invalid': True})
                wait_for(lambda text: 'Build error:' in text)
                self.assertEqual((self.root / 'resume/output/resume.json').read_bytes(), before)
                self.save('content/options.yaml', self.options)
                wait_for(lambda text: text.count('Generated resume/output/resume.json') >= 2)
            finally:
                process.terminate()
                try:
                    process.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    process.wait()

    def test_editor_schema_associations_validate_their_section_files(self):
        settings = json.loads((resume.ROOT / '.vscode/settings.json').read_text())
        for schema_path, yaml_path in settings['yaml.schemas'].items():
            path = (resume.ROOT / schema_path).resolve()
            wrapper = json.loads(path.read_text(encoding='utf-8'))
            source, pointer = wrapper['$ref'].split('#', 1)
            self.assertEqual((path.parent / source).resolve(), resume.ROOT / 'resume/resume.schema.json')
            section = self.schema
            for part in pointer.lstrip('/').split('/'):
                section = section[part.replace('~1', '/').replace('~0', '~')]
            editor_schema = {'$schema': self.schema['$schema'], '$defs': self.schema['$defs'], **section}
            validator = resume.Draft202012Validator(editor_schema, format_checker=resume.FormatChecker())
            validator.validate(resume.read_yaml(resume.ROOT / yaml_path))
            self.assertTrue(list(validator.iter_errors({'unexpectedField': True})), yaml_path)
        self.assertEqual(len(settings['yaml.schemas']), len(resume.SECTION_ORDER) + 1)

    def test_editor_build_commands_point_to_existing_script(self):
        tasks = json.loads((resume.ROOT / '.vscode/tasks.json').read_text())
        settings = json.loads((resume.ROOT / '.vscode/settings.json').read_text())
        for task in tasks['tasks']:
            path = task['args'][0].replace('${workspaceFolder}', str(resume.ROOT))
            self.assertTrue(Path(path).is_file(), path)
            self.assertIn('Scripts/python.exe', task['windows']['command'])
        for tool in settings['latex-workshop.latex.tools']:
            path = tool['args'][0].replace('%WORKSPACE_FOLDER%', str(resume.ROOT))
            self.assertTrue(Path(path).is_file(), path)
        self.assertEqual(settings['latex-workshop.latex.outDir'], '%WORKSPACE_FOLDER%/resume/output')

    def test_cli_paths_work_from_another_directory(self):
        result = subprocess.run([sys.executable, str(resume.ROOT / 'resume/scripts/build_resume.py'), '--validate-only'],
                                cwd=self.root, capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('are valid', result.stdout)


if __name__ == '__main__':
    unittest.main()
