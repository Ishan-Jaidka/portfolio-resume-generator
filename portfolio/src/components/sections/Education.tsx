import { dateRange, type Content } from '@/lib/content';

export default function Education({ content }: { content: Content }) {
  return <div className="education-list">{content.education.map((entry, index) => (
    <article key={index} className="degree-container">
      <h3 className="degree">{entry.degree}</h3>
      <p className="school">{entry.institution}</p>
      {entry.honors && <p>{entry.honors}</p>}
      {entry.gpa && <p>GPA: {entry.gpa}</p>}
      {(entry.startDate || entry.endDate) && <p className="daterange">{dateRange(entry.startDate, entry.endDate)}</p>}
    </article>
  ))}</div>;
}
