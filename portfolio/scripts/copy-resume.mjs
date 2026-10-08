import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';

const source = new URL('../../resume/output/cv.pdf', import.meta.url);
const publicDir = new URL('../public/', import.meta.url);
try {
  if (!readFileSync(source).subarray(0, 5).equals(Buffer.from('%PDF-'))) {
    throw new Error('The generated resume is not a valid PDF.');
  }
  mkdirSync(publicDir, { recursive: true });
  copyFileSync(source, new URL('resume.pdf', publicDir));
} catch (error) {
  throw new Error('Build the resume first: .venv/bin/python resume/scripts/build_resume.py', { cause: error });
}
