// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'QR GENERATO — Free Online QR Code Generator with Logo & UPI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          backgroundColor: '#07070b',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(124, 58, 237, 0.35), transparent 45%), radial-gradient(circle at 85% 80%, rgba(236, 72, 153, 0.3), transparent 45%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              fontWeight: 800,
            }}
          >
            QR
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em' }}>
              QR GENERATO PRO
            </span>
            <span style={{ fontSize: '16px', color: '#a1a1aa' }}>
              Free Online QR Code Generator • No Sign Up • No Expiration
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '920px' }}>
          <div
            style={{
              fontSize: '60px',
              fontWeight: 900,
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
            }}
          >
            The Best Free QR Code Generator With Logo, UPI & Pixel Artwork.
          </div>
          <div style={{ fontSize: '24px', color: '#d4d4d8', lineHeight: 1.4 }}>
            Convert any Link to QR, UPI Payment, Email, Wi-Fi, or vCard in seconds. Export high-resolution PNG, Vector SVG, & A4 Sticker Sheets 100% free.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          {[
            '100% Free Forever',
            'Zero Expiration',
            'UPI & Logo Support',
            'Instant PNG & Vector SVG',
          ].map((badge) => (
            <div
              key={badge}
              style={{
                padding: '10px 20px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '18px',
                fontWeight: 600,
                color: '#e4e4e7',
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}

