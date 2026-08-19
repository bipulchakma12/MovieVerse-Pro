import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #11121a, #0b0c10)',
          borderRadius: '8px',
          border: '1.5px solid #ff0844',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
        >
          <path
            d="M4 19V5C4 4.4 4.5 4 5 4.3L12 8.5L19 4.3C19.5 4 20 4.4 20 5V19C20 19.6 19.5 20 19 19.7L12 15.5L5 19.7C4.5 20 4 19.6 4 19Z"
            fill="url(#icon-grad)"
          />
          <polygon points="10,10 15,13 10,16" fill="#ffffff" />
          <defs>
            <linearGradient id="icon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff0844" />
              <stop offset="100%" stopColor="#f9d423" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
