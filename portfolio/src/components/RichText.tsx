import type { Bullet, TextRun } from '@/lib/content';

export function RichText({ runs }: { runs: TextRun[] }) {
  return runs.map((run, index) => run.url
    ? <a key={index} href={run.url}>{run.text}</a>
    : <span key={index}>{run.text}</span>);
}

export function Bullets({ items }: { items: Bullet[] }) {
  return <ul className="points">{items.map((bullet, index) => (
    <li key={index}>
      <RichText runs={bullet.runs} />
      {bullet.children && <Bullets items={bullet.children} />}
    </li>
  ))}</ul>;
}
