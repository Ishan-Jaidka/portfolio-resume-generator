# Local setup prompt

Tell your coding assistant with terminal access to this repository to follow this file.
It sets up and verifies the local environment; it does not personalize your resume.

```text
Set up this resume repository so I can edit YAML, build, and preview my resume locally.

Read README.md and src/docs/GUIDE.md, then inspect my OS and existing tools.

1. Create or reuse a repository-local .venv with Python 3.10 or newer. Install
   src/requirements.txt using that environment's interpreter. Ensure the VS Code
   build/watch tasks use this interpreter on my platform.
2. Ensure XeLaTeX and the class's required packages/fonts are available. Reuse an
   existing TeX installation; otherwise install the appropriate tools for my OS.
   If a step requires credentials or an administrator action you cannot perform,
   tell me exactly what I need to do and continue other useful setup work.
3. If VS Code is available, install any missing recommended extensions listed in
   .vscode/extensions.json and verify the configured build and PDF preview paths.
4. Run src/scripts/build_resume.py with the venv interpreter, both from the repo
   and from another working directory using absolute paths. Run the tests in
   src/tests. Confirm resume-output/resume.json, resume-output/cv.pdf, and the
   standalone LaTeX folder (cv.tex plus muratcan_cv.cls) are generated successfully.
5. Check that watch mode rebuilds when content changes, using a temporary copy
   for any test edits. Stop test watchers afterward. Inspect the PDF for page
   count, missing characters, clipping, and layout problems.

Keep resume-content/ and its options unchanged. Do not change templates, formatting,
validation rules, or build behavior to work around environment problems. Builds may
refresh generated outputs. Do not create a Git commit or push changes.

Finish with what you installed or configured, verification results, any remaining
blockers, and the exact commands/task names to build, watch, and preview on my OS.
Do not report a successful PDF build unless XeLaTeX actually compiled it.
```

For manual setup, use the [full guide](GUIDE.md) or [quick start](../../README.md).
