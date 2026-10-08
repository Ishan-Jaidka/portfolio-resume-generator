# YAML Resume

Create a resume from plain YAML. The build validates your content and generates a
PDF, JSON, and portable LaTeX.

**Edit:** `resume-content/`

**Results:** `resume-output/`

**Implementation:** `src/`

## Quick start

### AI Assisted Repo Jumpstart

Copy and paste this into Copilot, Codex, or another
coding assistant with access to this repo:

```text
Please follow the instructions in src/docs/SETUP_PROMPT.md to set up this repo locally.
```

[View the setup prompt](src/docs/SETUP_PROMPT.md).

---

### Manual setup

Install Python 3.10+ and XeLaTeX ([MacTeX](https://tug.org/mactex/) on macOS,
[MiKTeX](https://miktex.org/download) on Windows). From the repository folder:

**macOS**

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r src/requirements.txt
.venv/bin/python src/scripts/build_resume.py
```

**Windows — PowerShell**

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r src\requirements.txt
.\.venv\Scripts\python.exe src\scripts\build_resume.py
```

Edit the YAML and rebuild, then open **`resume-output/cv.pdf`**. Add `--watch` to
rebuild automatically. In VS Code, use the default build task or **Resume: watch**.

See the [full guide](src/docs/GUIDE.md) for editing fields, PDF preview, troubleshooting,
and implementation details.
