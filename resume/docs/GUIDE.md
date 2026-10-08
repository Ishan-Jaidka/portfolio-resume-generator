# Setup and editing guide

Return to the [quick start](../../README.md). For assisted local setup, use the
[setup prompt](SETUP_PROMPT.md).

1. **Edit `content/`.** Replace the sample profile, skills, experience,
   projects, and education with your own. Change `options.yaml` to choose which
   sections appear.
2. **Build.** In VS Code, press **Cmd+Shift+B** on macOS or **Ctrl+Shift+B** on Windows.
3. **Open `resume/output/cv.pdf`.** Your validated JSON and portable LaTeX files are
   also in `resume/output/`.

Complete the one-time setup below first. For automatic rebuilding while you edit,
run **Tasks: Run Task → Resume: watch** in VS Code. Stop it with **Tasks: Terminate Task**.

## One-time setup

Install Python 3.10 or newer, XeLaTeX, and [VS Code](https://code.visualstudio.com/).
Open this repository folder in VS Code and install the recommended **LaTeX Workshop**
and **YAML** extensions. YAML provides field suggestions and validation as you edit;
its workspace schema associations point to the same rules the build uses.

### macOS

Install [MacTeX](https://tug.org/mactex/), or use `brew install --cask mactex`.
Restart your terminal and VS Code, then run these commands from the repository folder:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r resume/requirements.txt
xelatex --version
.venv/bin/python resume/scripts/build_resume.py
```

BasicTeX requires additional packages and fonts, including `noto` and `fontawesome5`.
The build checks `/Library/TeX/texbin/xelatex` if XeLaTeX is missing from `PATH`.

### Windows

Install [Python](https://www.python.org/downloads/windows/) and
[MiKTeX](https://miktex.org/download). Update MiKTeX in MiKTeX Console and enable
installation of missing packages. Restart your terminal and VS Code, then run
these commands in PowerShell from the repository folder:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r resume\requirements.txt
xelatex --version
.\.venv\Scripts\python.exe resume\scripts\build_resume.py
```

If `py` is unavailable, use your installed `python` executable to create the venv.
MiKTeX's first build may install required packages and fonts. Both platforms' VS Code
build/watch tasks use the repository's `.venv`, so you don't need to activate it.

## What to edit

Everything needed to customize your resume is in **`content/`**:

| File | What it controls |
| --- | --- |
| `profile.yaml` | Name, contact details, optional header note, and header links |
| `skills.yaml` | Ordered skills and cloud groups, including optional automation skills |
| `experience.yaml` | Roles, dates, and nested bullets |
| `projects.yaml` | Project names, descriptions, and links |
| `education.yaml` | Degrees, institutions, optional honors/GPA, and dates |
| `interests.yaml` | Optional interests; this file may be omitted |
| `options.yaml` | Theme color, section visibility, and automation skill visibility |

Use plain text, including `C#`, `&`, `$`, `%`, and underscores. The build escapes
LaTeX characters for you; don't put LaTeX commands in YAML.

- **Dates:** quote `YYYY-MM`, such as `'2025-05'`. Set `endDate: null` for an ongoing
  role. Education permits unknown dates as `null`, which are hidden.
- **Honors/GPA:** omit them or use `null` to hide them. Use quoted GPA display text,
  such as `gpa: '3.8/4.0'`. GPA appears on the right of the degree line, styled like
  experience dates. If education dates are present too, a pipe separates them.
- **Header links:** `links.linkedin.show` and `links.github.show` independently control
  visibility. Each link keeps its own `text` and HTTP(S) `url`.
- **Header note:** `miscellaneous.text` can contain citizenship or another short note.
  `miscellaneous.show: false` hides both the note and its preceding pipe.
- **Options:** `sections` controls whole sections, and `automation` controls the skill
  row with id `automation`. `theme.color` accepts a named LaTeX color. Current defaults
  use MidnightBlue, with automation, interests, and GitHub hidden.

Bullets use ordered text `runs` and optional nested `children`. Link runs use
`text` and `url`. Adjacent runs concatenate exactly, so preserve surrounding spaces:

```yaml
- runs:
    - text: 'Built a service with '
    - text: documentation
      url: https://example.com/docs
    - text: ' and automated deployments.'
  children:
    - runs:
        - text: Reduced manual work by 40%.
```

Projects use the same runs in `description`, with optional title `links`. Skill
`groups` contain ordered `items` and optional labels such as Azure and AWS.
Inspect the PDF after editing: additional content or optional sections may require
shortening text to retain a one-page layout. Hidden content remains in the JSON export.

## Preview in VS Code

Open `resume/output/latex/cv.tex`, then run **LaTeX Workshop: View LaTeX PDF file**.
The viewer is configured to open **`resume/output/cv.pdf`**, and refreshes after a
successful build. Arrange it beside your YAML files.

To build through LaTeX Workshop, run **Build with recipe** and select **Resume pipeline
(macOS)** or **Resume pipeline (Windows)**. It remembers the last recipe; Windows
users should select the Windows recipe once. The default VS Code build task chooses
the platform automatically.

LaTeX Workshop magic compiler comments and automatic builds are disabled so generated
TeX saves cannot bypass the pipeline or trigger build loops. Use **Resume: watch**
for automatic builds of your YAML. See the official [recipe documentation](https://github.com/James-Yu/LaTeX-Workshop/wiki/Compile)
and [viewer documentation](https://github.com/James-Yu/LaTeX-Workshop/wiki/View).

## Folder structure

```text
content/           # Your editable content and options
  profile.yaml
  skills.yaml
  experience.yaml
  projects.yaml
  education.yaml
  interests.yaml
  options.yaml
resume/output/            # Generated files to preview, share, or keep
  cv.pdf
  resume.json
  latex/
    cv.tex
    muratcan_cv.cls        # Generated copy; keeps this LaTeX folder portable
resume/                      # Build implementation
  templates/cv.tex.j2
  latex/muratcan_cv.cls    # Formatting source
  scripts/build_resume.py
  tests/
  schemas/                # Editor references to the shared schema
  docs/                   # Detailed guide and optional setup prompt
  resume.schema.json      # Validation contract, shared model version 1.0.0
  requirements.txt
  build/                  # Ignored compiler files, logs, and build lock
README.md
.gitignore
.gitattributes
.vscode/                  # Build/watch tasks, preview, and YAML schema associations
```

Files in `resume/output/` are generated. Edit YAML to change your resume; edit
`resume/templates/` or `resume/latex/` only when changing the formatting implementation.
The generated JSON and LaTeX include notices pointing to their source files.

## Terminal commands

From the repository folder on macOS:

```sh
.venv/bin/python resume/scripts/build_resume.py
.venv/bin/python resume/scripts/build_resume.py --watch
.venv/bin/python resume/scripts/build_resume.py --validate-only
.venv/bin/python resume/scripts/build_resume.py --no-pdf
.venv/bin/python -m unittest discover -s resume/tests -v
```

On Windows:

```powershell
.\.venv\Scripts\python.exe resume\scripts\build_resume.py
.\.venv\Scripts\python.exe resume\scripts\build_resume.py --watch
.\.venv\Scripts\python.exe resume\scripts\build_resume.py --validate-only
.\.venv\Scripts\python.exe resume\scripts\build_resume.py --no-pdf
.\.venv\Scripts\python.exe -m unittest discover -s resume\tests -v
```

`--validate-only` checks content, options, schema, template, and class availability
without writing outputs. `--no-pdf` generates JSON, LaTeX, and the copied class without
requiring XeLaTeX. Watch mode builds immediately, monitors content/options, schema,
all templates, the source class, and the build script, and continues after errors.
It detects creation/deletion of optional interests and debounces saves. Stop with
Ctrl+C. Restart the watcher after changing the Python script to load its new code.

All internal paths resolve from the script location. From any working directory,
provide absolute paths to the interpreter and script:

```sh
"/path/to/resume-latex/.venv/bin/python" "/path/to/resume-latex/resume/scripts/build_resume.py" --watch
```

```powershell
& "C:\path with spaces\resume-latex\.venv\Scripts\python.exe" "C:\path with spaces\resume-latex\resume\scripts\build_resume.py" --watch
```

To keep or share standalone LaTeX, copy **the entire `resume/output/latex/` folder**.
With XeLaTeX installed, compile from that folder:

```sh
xelatex -interaction=nonstopmode -halt-on-error cv.tex
```

Run it twice if links/outlines need another pass. Standalone compilation writes its
PDF beside `cv.tex`; the normal pipeline publishes `resume/output/cv.pdf` instead.

## Build behavior and troubleshooting

The loader explicitly reads **profile → skills → experience → projects → education →
interests**, preserving entry and bullet order. The pipeline validates the combined
`schemaVersion` model, exports all content to JSON, renders escaped LaTeX, copies the
class, and runs XeLaTeX twice. The compiler works in **`resume/output/latex/`**, with
output in **`resume/build/`** and shell escape disabled.

Validation errors leave outputs alone. Compiler errors preserve the last successful
`resume/output/cv.pdf`; JSON and LaTeX may already reflect the new content. Only a
successful compilation producing a fresh PDF allows atomic replacement of the published
PDF. Errors report the source/property or compiler log and return a nonzero exit status.

- **Missing Python dependency:** install `resume/requirements.txt` with the interpreter
  used by the task; ensure `.venv` is at the repository root.
- **Validation error:** check the named YAML field. Duplicate keys, unknown fields,
  invalid dates, reversed date ranges, duplicate skill ids, and nonboolean flags are errors.
- **XeLaTeX not found:** restart VS Code and check `xelatex --version`. On Windows,
  `where.exe xelatex` should find MiKTeX. Install missing fonts/packages through MiKTeX
  Console or MacTeX's package manager; the class requires XeLaTeX because it uses `fontspec`.
- **Compiler failure:** inspect `resume/build/cv.log`; the published PDF may be from an older build.
- **Build already running:** stop other builds/watchers. If a process crashed, remove
  the empty `resume/build/.resume-build.lock` directory before retrying.
- **Box warnings:** inspect the PDF for overflow or changed line breaks; successful
  compilation alone does not guarantee that expanded content still fits on one page.

Track source files and **all finished files in `resume/output/`**, including the copied
class, alongside content changes. `.gitattributes` marks generated text for repository
viewers. `resume/build/`, `.venv/`, Python caches, and compiler auxiliary files are ignored.
The build never stages, commits, or pushes files.
