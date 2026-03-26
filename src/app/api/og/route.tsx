// app/api/og/route.tsx
import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        background: '#080810',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        border: '1px solid rgba(201,168,76,0.3)',
      }}>
        <div style={{ color: '#c9a84c', fontSize: 18, letterSpacing: '0.3em', marginBottom: 24 }}>
          THE DEVELOPER ACCOUNTABILITY PLATFORM
        </div>
        <div style={{ color: '#f0ead6', fontSize: 80, fontStyle: 'italic', fontWeight: 300 }}>
          ShipYard
        </div>
        <div style={{ color: '#8a8a9a', fontSize: 28, marginTop: 16 }}>
          Declare. Ship. Own the Graveyard.
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}