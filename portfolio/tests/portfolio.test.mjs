import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { parse } from 'yaml';

const read = (name) => readFileSync(new URL(name, import.meta.url), 'utf8');
const yaml = (name) => parse(read(`../../content/${name}.yaml`));
const config = yaml('portfolio');
const ajv = new Ajv2020({ allErrors: true });
addFormats(ajv);
const validate = ajv.compile(JSON.parse(read('../portfolio.schema.json')));
const html = read('../.next/server/app/index.html').replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#x27;');

function containsText(value) {
  assert.ok(html.includes(escape(value)), `Missing shared text: ${value}`);
}

test('portfolio config validates and rejects unsafe or invalid display settings', () => {
  assert.ok(validate(config), ajv.errorsText(validate.errors));
  for (const invalid of [
    { ...config, theme: { ...config.theme, accent: 'red; background:url(x)' } },
    { ...config, experience: { ...config.experience, previewBullets: -1 } },
    { ...config, hero: { ...config.hero, portrait: { src: '/../secret', alt: 'invalid' } } },
    { ...config, sections: [{ id: 'unknown', title: 'Unknown', navLabel: null }] },
    { ...config, typo: true },
  ]) assert.equal(validate(invalid), false);
});

test('the rendered page uses configured section order, headings, and portrait', () => {
  let previous = -1;
  for (const section of config.sections) {
    const position = html.indexOf(`id="${section.id}"`);
    assert.ok(position > previous, `Section out of order or absent: ${section.id}`);
    previous = position;
    containsText(section.title);
  }
  containsText(config.hero.intro);
  containsText(config.hero.portrait.alt);
  assert.ok(html.includes(`href="#${config.hero.primaryAction.section}"`));
});

test('shared projects and recursive experience bullets survive prerendering', () => {
  if (config.sections.some((section) => section.id === 'projects')) {
    for (const project of yaml('projects')) {
      containsText(project.name);
      for (const run of project.description) {
        containsText(run.text);
        if (run.url) assert.ok(html.includes(`href="${escape(run.url)}"`));
      }
    }
  }
  const checkBullet = (bullet) => {
    for (const run of bullet.runs) containsText(run.text);
    for (const child of bullet.children ?? []) checkBullet(child);
  };
  if (config.sections.some((section) => section.id === 'experience')) {
    for (const entry of yaml('experience')) {
      containsText(entry.company);
      for (const bullet of entry.bullets) checkBullet(bullet);
    }
    const expected = yaml('experience').filter((entry) => entry.bullets.length > config.experience.previewBullets).length;
    assert.equal((html.match(/<details /g) ?? []).length, expected);
  }
});

test('contact visibility is independent of PDF flags and PDF bytes are preserved', () => {
  const profile = yaml('profile');
  assert.equal(html.includes('href="tel:'), config.contacts.showPhone);
  for (const key of config.contacts.links) assert.ok(html.includes(`href="${escape(profile.links[key].url)}"`));
  assert.ok(html.includes('href="/resume.pdf"'));
  assert.deepEqual(readFileSync(new URL('../public/resume.pdf', import.meta.url)),
    readFileSync(new URL('../../resume/output/cv.pdf', import.meta.url)));
});
