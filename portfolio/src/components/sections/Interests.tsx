import type { Content } from '@/lib/content';

export default function Interests({ content }: { content: Content }) {
  return <ul className="interest-list">{content.interests.map((interest) => (
    <li key={interest}>{interest}</li>
  ))}</ul>;
}
