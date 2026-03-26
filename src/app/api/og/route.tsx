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
        position: 'relative', overflow: 'hidden',
      }}>

        {/* Gold corner accents */}
        <div style={{ position:'absolute', top:0, left:0, width:80, height:80, borderTop:'1px solid rgba(201,168,76,0.5)', borderLeft:'1px solid rgba(201,168,76,0.5)', display:'flex' }} />
        <div style={{ position:'absolute', top:0, right:0, width:80, height:80, borderTop:'1px solid rgba(201,168,76,0.5)', borderRight:'1px solid rgba(201,168,76,0.5)', display:'flex' }} />
        <div style={{ position:'absolute', bottom:0, left:0, width:80, height:80, borderBottom:'1px solid rgba(201,168,76,0.5)', borderLeft:'1px solid rgba(201,168,76,0.5)', display:'flex' }} />
        <div style={{ position:'absolute', bottom:0, right:0, width:80, height:80, borderBottom:'1px solid rgba(201,168,76,0.5)', borderRight:'1px solid rgba(201,168,76,0.5)', display:'flex' }} />

        {/* Subtle gold radial glow */}
        <div style={{
          position:'absolute', top:'50%', left:'50%',
          transform:'translate(-50%, -50%)',
          width:700, height:700, borderRadius:'50%',
          background:'radial-gradient(ellipse, rgba(201,168,76,0.07) 0%, transparent 70%)',
          display:'flex',
        }} />

        {/* Top gold divider line */}
        <div style={{
          position:'absolute', top:48, left:'10%', right:'10%', height:1,
          background:'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
          display:'flex',
        }} />

        {/* Bottom gold divider line */}
        <div style={{
          position:'absolute', bottom:48, left:'10%', right:'10%', height:1,
          background:'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)',
          display:'flex',
        }} />

        {/* Eyebrow */}
        <div style={{
          display:'flex', alignItems:'center', gap:16, marginBottom:28,
        }}>
          <div style={{ width:40, height:1, background:'rgba(201,168,76,0.5)' }} />
          <div style={{ color:'#c9a84c', fontSize:13, letterSpacing:'0.35em', fontWeight:500 }}>
            THE DEVELOPER ACCOUNTABILITY PLATFORM
          </div>
          <div style={{ width:40, height:1, background:'rgba(201,168,76,0.5)' }} />
        </div>

        {/* Main title */}
        <div style={{
          color:'#f0ead6', fontSize:96, fontStyle:'italic', fontWeight:300,
          letterSpacing:'-0.02em', lineHeight:1, marginBottom:20,
        }}>
          ShipYard
        </div>

        {/* Tagline */}
        <div style={{
          color:'#8a8a9a', fontSize:26, fontStyle:'italic', fontWeight:300,
          letterSpacing:'0.02em', marginBottom:48, textAlign:'center',
          maxWidth:700,
        }}>
          Declare your build. Track every task. Ship or own the graveyard.
        </div>

        {/* Stat pills */}
        <div style={{ display:'flex', gap:0, marginBottom:48, border:'1px solid rgba(201,168,76,0.15)' }}>
          {[
            { val: '847', label: 'Active Builders' },
            { val: '2,341', label: 'Projects Declared' },
            { val: '1,290', label: 'Buried in Graveyard' },
          ].map((s, i) => (
            <div key={s.label} style={{
              padding:'14px 32px', textAlign:'center',
              borderRight: i < 2 ? '1px solid rgba(201,168,76,0.15)' : 'none',
              display:'flex', flexDirection:'column', gap:6,
            }}>
              <span style={{ color:'#c9a84c', fontSize:24, fontWeight:500, fontFamily:'monospace' }}>{s.val}</span>
              <span style={{ color:'#8a8a9a', fontSize:11, letterSpacing:'0.18em', textTransform:'uppercase' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* CTA button */}
        <div style={{
          background:'#c9a84c', color:'#080810',
          padding:'14px 40px', fontSize:13,
          fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase',
        }}>
          Join Free · Commission via GitHub →
        </div>

        {/* Bottom URL */}
        <div style={{
          position:'absolute', bottom:20,
          color:'rgba(138,138,154,0.4)', fontSize:12,
          letterSpacing:'0.1em', fontFamily:'monospace',
        }}>
          shipyard-io.vercel.app
        </div>

      </div>
    ),
    { width: 1200, height: 630 }
  )
}