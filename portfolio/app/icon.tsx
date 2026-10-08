import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ImageResponse } from 'next/og';
import { getPortfolioConfig } from '@/lib/portfolio';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';
export const dynamic = 'force-static';

// Derive the circular tab icon from the same YAML-selected portrait as the page.
export default function Icon() {
  const { src } = getPortfolioConfig().hero.portrait;
  const bytes = readFileSync(path.join(process.cwd(), 'public', src));
  const mime = path.extname(src).toLowerCase() === '.png' ? 'image/png'
    : path.extname(src).toLowerCase() === '.webp' ? 'image/webp' : 'image/jpeg';
  return new ImageResponse(
    <div style={{ display: 'flex', width: 64, height: 64, borderRadius: '50%', overflow: 'hidden' }}>
      <img src={`data:${mime};base64,${bytes.toString('base64')}`} width={64} height={64}
        alt="" style={{ objectFit: 'cover' }} />
    </div>,
    size,
  );
}
