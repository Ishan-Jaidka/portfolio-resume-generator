import Image from 'next/image';
import type { ProjectPresentation } from '@/lib/portfolio';

// Decorative illustrations, not screenshots. Real images can be supplied in YAML.
export default function ProjectVisual({ presentation }: { presentation: ProjectPresentation }) {
  if (presentation.image) {
    return <div className="project-visual project-visual--image">
      <Image src={presentation.image.src} alt={presentation.image.alt}
        width={900} height={600} sizes="(max-width: 735px) 100vw, 33vw" />
    </div>;
  }
  return <div className="project-visual" aria-hidden="true">
    <svg viewBox="0 0 320 200" fill="none" className="project-illustration">
      {presentation.illustration === 'city' ? <>
        <path d="M30 156H290M54 156V72H111V156M122 156V42H190V156M202 156V93H266V156" />
        <path d="M67 88H80M89 88H99M67 109H80M89 109H99M67 130H80M89 130H99M137 60H151M163 60H177M137 83H151M163 83H177M137 106H151M163 106H177M216 111H232M242 111H254M216 133H232M242 133H254" />
        <circle cx="259" cy="52" r="21" /><path d="M249 52L256 59L270 44M148 156V132H165V156" />
      </> : presentation.illustration === 'calculator' ? <>
        <rect x="90" y="20" width="140" height="160" rx="14" />
        <rect x="107" y="37" width="106" height="39" rx="5" />
        {[0, 1, 2].flatMap((row) => [0, 1, 2].map((col) => (
          <rect key={`${row}-${col}`} x={108 + col * 38} y={93 + row * 24} width="27" height="15" rx="3" />
        )))}
        <path d="M61 134L42 154M260 49L278 31M130 56H158M188 50V64M181 57H195" />
      </> : presentation.illustration === 'greenhouse' ? <>
        <path d="M54 162V82L160 27L266 82V162H54ZM54 82H266M160 27V162M106 56V162M214 56V162M54 120H266" />
        <path d="M81 145V125M81 133C65 134 65 119 81 125M81 141C96 140 96 125 81 131M133 145V125M133 133C117 134 117 119 133 125M186 145V125M186 133C202 134 202 119 186 125M240 145V125M240 133C224 134 224 119 240 125" />
        <path d="M40 175H280" />
      </> : <>
        <rect x="54" y="38" width="212" height="125" rx="12" />
        <path d="M54 67H266M121 91L100 113L121 135M199 91L220 113L199 135M174 87L146 140" />
      </>}
    </svg>
  </div>;
}
