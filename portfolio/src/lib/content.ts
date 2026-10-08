import { readFileSync } from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';
import { cache } from 'react';
import { parse } from 'yaml';

export interface TextRun { text: string; url?: string }
export interface Bullet { runs: TextRun[]; children?: Bullet[] }
export interface Profile {
  name: string;
  address: string;
  phone: string;
  email: string;
  miscellaneous: { text: string; show: boolean };
  links: Record<string, { text: string; url: string; show: boolean }>;
}
export interface Experience {
  company: string; role: string; location: string;
  startDate: string; endDate: string | null; bullets: Bullet[];
}
export interface Project { name: string; description: TextRun[]; links?: TextRun[] }
export interface Education {
  degree: string; institution: string; honors?: string | null; gpa?: string | null;
  startDate: string | null; endDate: string | null;
}
export interface Content {
  profile: Profile; experience: Experience[]; projects: Project[]; education: Education[]; interests: string[];
}

// Server-only reads, evaluated while Next prerenders the page. No copied data file.
const repoRoot = path.resolve(process.cwd(), '..');
export const getContent = cache((): Content => {
  const schema = JSON.parse(readFileSync(path.join(repoRoot, 'resume/resume.schema.json'), 'utf8'));
  const ajv = new Ajv2020({ allErrors: true });
  addFormats(ajv);
  const validate = ajv.compile<Content>(schema);
  const data: Record<string, unknown> = {
    $comment: schema.properties.$comment.const,
    schemaVersion: schema.properties.schemaVersion.const,
  };
  for (const section of ['profile', 'skills', 'experience', 'projects', 'education', 'interests']) {
    const file = path.join(repoRoot, 'content', `${section}.yaml`);
    try {
      data[section] = parse(readFileSync(file, 'utf8'));
    } catch (error) {
      if (section === 'interests' && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        data[section] = [];
      } else {
        throw new Error(`Cannot read ${file}`, { cause: error });
      }
    }
  }
  if (!validate(data)) {
    throw new Error(`Invalid shared YAML: ${ajv.errorsText(validate.errors, { separator: '\n' })}`);
  }
  for (const entry of [...data.experience, ...data.education]) {
    if (entry.startDate && entry.endDate && entry.startDate > entry.endDate) {
      throw new Error('Invalid shared YAML: endDate must not precede startDate.');
    }
  }
  return data;
});

export function dateRange(start: string | null, end: string | null): string {
  const format = (date: string) => new Intl.DateTimeFormat('en-US', {
    month: 'short', year: 'numeric', timeZone: 'UTC',
  }).format(new Date(`${date}-01T00:00:00Z`));
  if (!start) return end ? format(end) : '';
  return `${format(start)} – ${end ? format(end) : 'Present'}`;
}
