import { useCallback, useEffect, useRef, useState } from 'react'
import { profile, experience, projects, education, skills, strengths, certificates, languages } from '../data.js'
import Visual from './Visual.jsx'
import Reveal from './Reveal.jsx'
import ResumeActions from './ResumeActions.jsx'
import './story-live.css' // only the new "live" layers. Your own story CSS stays as it is.

const SPEED = 70 // auto-scroll speed in pixels per second (lower = slower)

// Sky colours (top, bottom) at five points along the day.
const SKY = [
  [[11, 14, 43], [27, 33, 80]],
  [[48, 62, 128], [226, 150, 88]],
  [[30, 74, 138], [96, 154, 204]],
  [[34, 82, 148], [226, 190, 120]],
  [[24, 34, 82], [226, 140, 62]],
]
// The hills change colour with the sky. At the start they match your original colours.
const HILL_BACK = [[26, 35, 82], [58, 66, 118], [52, 92, 128], [74, 104, 118], [74, 44, 88]]
const HILL_FRONT = [[11, 15, 46], [22, 28, 68], [24, 52, 76], [36, 62, 66], [28, 20, 52]]

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t))
const along = (list, p) => {
  const x = p * (list.length - 1)
  const i = Math.min(Math.floor(x), list.length - 2)
  return { a: list[i], b: list[i + 1], t: x - i }
}
const rgb = (c) => `rgb(${c.join(',')})`
const colour = (list, p) => {
  const { a, b, t } = along(list, p)
  return rgb(mix(a, b, t))
}
const sky = (p) => {
  const { a, b, t } = along(SKY, p)
  return [0, 1].map((k) => rgb(mix(a[k], b[k], t)))
}

// The scroll is one day: from 4:50 am to 6:40 pm.
const clock = (p) => {
  const m = Math.round(290 + p * 830)
  const h24 = Math.floor(m / 60) % 24
  return `${h24 % 12 || 12}:${String(m % 60).padStart(2, '0')} ${h24 < 12 ? 'am' : 'pm'}`
}

const chapters = ['Before light', 'First light', 'Sunrise', 'Daylight', 'Golden hour']
const timeline = [...education].reverse() // oldest first

// Twinkling stars and floating lights (fixed positions, so they are the same on every render).
const TWINKLE = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 37 + 11) % 97,
  y: (i * 53 + 7) % 58,
  d: (((i * 7) % 9) / 3).toFixed(1),
  s: 2 + (i % 3),
}))
const MOTES = Array.from({ length: 14 }, (_, i) => ({
  x: (i * 29 + 6) % 94,
  b: 6 + ((i * 11) % 24),
  d: ((i * 5) % 11).toFixed(1),
  t: 9 + (i % 5) * 2,
}))

const reducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Soft ambient pad made with the Web Audio API (no audio file needed).
// Its brightness follows the sun: setProgress(0..1). In daylight, small birds sing now and then.
function createAmbience() {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  const ctx = new Ctx()
  const master = ctx.createGain()
  master.gain.value = 0
  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 500
  filter.Q.value = 0.7
  filter.connect(master)
  master.connect(ctx.destination)
  ;[110, 164.81, 220, 277.18, 329.63].forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = i % 2 ? 'sine' : 'triangle'
    osc.frequency.value = freq
    osc.detune.value = (i - 2) * 5
    gain.gain.value = 0.16 / (1 + i * 0.35)
    osc.connect(gain)
    gain.connect(filter)
    osc.start()
  })
  const lfo = ctx.createOscillator()
  const depth = ctx.createGain()
  lfo.frequency.value = 0.08
  depth.gain.value = 180
  lfo.connect(depth)
  depth.connect(filter.frequency)
  lfo.start()

  // Birds: short, quiet chirps on their own volume control.
  const birds = ctx.createGain()
  birds.gain.value = 0
  birds.connect(ctx.destination)
  let progress = 0
  let timer = 0
  let birdTimer = 0
  const chirp = () => {
    const day = Math.sin(Math.PI * progress)
    if (day < 0.3) return
    const notes = 2 + Math.floor(Math.random() * 3)
    const base = 2600 + Math.random() * 1600
    for (let n = 0; n < notes; n += 1) {
      const t0 = ctx.currentTime + n * 0.13
      const osc = ctx.createOscillator()
      const env = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(base, t0)
      osc.frequency.exponentialRampToValueAtTime(base * (1.25 + Math.random() * 0.25), t0 + 0.08)
      env.gain.setValueAtTime(0.0001, t0)
      env.gain.exponentialRampToValueAtTime(0.012 * day, t0 + 0.02)
      env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.1)
      osc.connect(env)
      env.connect(birds)
      osc.start(t0)
      osc.stop(t0 + 0.12)
    }
  }
  const scheduleBirds = () => {
    birdTimer = setTimeout(() => {
      chirp()
      scheduleBirds()
    }, 2500 + Math.random() * 5500)
  }
  return {
    start() {
      clearTimeout(timer)
      clearTimeout(birdTimer)
      ctx.resume()
      master.gain.setTargetAtTime(0.5, ctx.currentTime, 1.2)
      birds.gain.setTargetAtTime(1, ctx.currentTime, 1.2)
      scheduleBirds()
    },
    stop() {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.4)
      birds.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
      clearTimeout(birdTimer)
      clearTimeout(timer)
      timer = setTimeout(() => ctx.suspend().catch(() => {}), 1800)
    },
    setProgress(p) {
      progress = p
      filter.frequency.setTargetAtTime(380 + 1500 * Math.sin(Math.PI * p), ctx.currentTime, 1.5)
    },
    close() {
      clearTimeout(timer)
      clearTimeout(birdTimer)
      ctx.close().catch(() => {})
    },
  }
}

// Play button: above the mode switch on larger screens, a round icon beside it on phones.
const playCss = `
.play-btn { position: fixed; left: 50%; bottom: calc(5.2rem + env(safe-area-inset-bottom, 0px)); translate: -50% 0; z-index: 45; gap: .55rem; white-space: nowrap; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
.play-btn:not(.solid) { background: rgba(9, 12, 36, .6); }
@media (max-width: 600px) {
  .play-btn { left: auto; right: .6rem; translate: none; bottom: calc(1rem + env(safe-area-inset-bottom, 0px)); width: 54px; height: 54px; min-height: 54px; padding: 0; justify-content: center; border-radius: 50%; }
  .play-btn span { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
}
@media (max-width: 400px) { .switch button { padding: 0 .9rem; } }
`

const Play = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
  </svg>
)
const Pause = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <rect x="6" y="4" width="4.5" height="16" rx="1" />
    <rect x="13.5" y="4" width="4.5" height="16" rx="1" />
  </svg>
)

// A small flock of birds. Each bird flaps its wings (see story-live.css).
const Flock = ({ className }) => (
  <svg className={`lv lv-flock ${className}`} viewBox="0 0 220 60">
    <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 30q8-11 16 0q8-11 16 0" />
      <path d="M60 14q6-8 12 0q6-8 12 0" />
      <path d="M104 38q7-9 14 0q7-9 14 0" />
      <path d="M160 20q5-7 10 0q5-7 10 0" />
    </g>
  </svg>
)

export default function Story({ onWebsite }) {
  const root = useRef(null)
  const stage = useRef(null)
  const clockEl = useRef(null)
  const raf = useRef(0)
  const audio = useRef(null)
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)

  const stop = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current)
    raf.current = 0
    audio.current?.stop()
    setPlaying(false)
  }, [])

  // Slowly scrolls the page and plays the ambient sound. The sky and sun follow the scroll.
  const play = () => {
    if (!audio.current) audio.current = createAmbience()
    audio.current?.start()
    const maxNow = document.documentElement.scrollHeight - window.innerHeight
    if (window.scrollY >= maxNow - 2) window.scrollTo({ top: 0, behavior: 'instant' })
    let pos = window.scrollY
    let last = performance.now()
    setPlaying(true)
    const tick = (now) => {
      const dt = Math.min(now - last, 64) // cap, so a busy frame never causes a jump
      last = now
      // The reader moved the page themselves (scrollbar drag, etc.): hand control back.
      if (Math.abs(window.scrollY - pos) > 3) {
        stop()
        return
      }
      const limit = document.documentElement.scrollHeight - window.innerHeight
      pos = Math.min(limit, pos + (SPEED * dt) / 1000)
      window.scrollTo({ top: pos, behavior: 'instant' })
      if (pos >= limit) {
        stop()
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  // Any manual input (except on the play button itself) pauses the story.
  useEffect(() => {
    const onInput = (e) => {
      if (e.target instanceof Element && e.target.closest('[data-play]')) return
      stop()
    }
    const events = ['wheel', 'touchstart', 'keydown']
    events.forEach((name) => window.addEventListener(name, onInput, { passive: true }))
    return () => {
      events.forEach((name) => window.removeEventListener(name, onInput))
      if (raf.current) cancelAnimationFrame(raf.current)
      audio.current?.close()
      audio.current = null
    }
  }, [stop])

  useEffect(() => {
    let frame = 0
    let lastClock = ''
    const update = () => {
      frame = 0
      const el = stage.current
      if (!el) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? clamp(window.scrollY / max) : 0
      const [top, bottom] = sky(p)
      el.style.setProperty('--top', top)
      el.style.setProperty('--bottom', bottom)
      el.style.setProperty('--p', p.toFixed(4))
      el.style.setProperty('--sx', `${14 + 72 * p}%`)
      el.style.setProperty('--sy', `${94 - 76 * Math.sin(Math.PI * p)}%`)
      el.style.setProperty('--stars', Math.max(0, 1 - p * 4).toFixed(2))
      // New: how much daylight there is, how close it is to evening, and the hill colours.
      el.style.setProperty('--day', Math.sin(Math.PI * p).toFixed(3))
      el.style.setProperty('--dusk', clamp((p - 0.7) / 0.3).toFixed(3))
      el.style.setProperty('--hill-back', colour(HILL_BACK, p))
      el.style.setProperty('--hill-front', colour(HILL_FRONT, p))
      document.documentElement.style.setProperty('--story-p', p.toFixed(4))
      audio.current?.setProgress(p)
      const t = clock(p)
      if (clockEl.current && t !== lastClock) {
        lastClock = t
        clockEl.current.textContent = t
      }
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    // The sky moves a little with the mouse, so the scene feels alive even when you stand still.
    let moveFrame = 0
    let mx = 0
    let my = 0
    const applyMove = () => {
      moveFrame = 0
      stage.current?.style.setProperty('--mx', mx.toFixed(3))
      stage.current?.style.setProperty('--my', my.toFixed(3))
    }
    const onMove = (e) => {
      if (e.pointerType === 'touch') return
      mx = (e.clientX / window.innerWidth) * 2 - 1
      my = (e.clientY / window.innerHeight) * 2 - 1
      if (!moveFrame) moveFrame = requestAnimationFrame(applyMove)
    }
    if (!reducedMotion()) window.addEventListener('pointermove', onMove, { passive: true })

    let io
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
        { threshold: 0.4 }
      )
      root.current?.querySelectorAll('.chapter').forEach((c) => io.observe(c))
    }
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.removeEventListener('pointermove', onMove)
      if (frame) cancelAnimationFrame(frame)
      if (moveFrame) cancelAnimationFrame(moveFrame)
      io?.disconnect()
    }
  }, [])

  const go = (i) => {
    stop()
    document.getElementById(`ch${i}`)?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' })
  }
  const cls = (i, extra = '') => `chapter ${extra} ${active === i ? 'in' : ''}`.trim()

  // Show the phone number only when it is a real one.
  const hasPhone = profile.phone && !/x/i.test(profile.phone)
  const sideProjects = projects.slice(1)

  return (
    <div className="story" ref={root}>
      <style>{playCss}</style>

      <div className="stage" ref={stage} aria-hidden="true">
        <div className="stars" />
        <div className="lv lv-twinkle">
          {TWINKLE.map((s, i) => (
            <i key={i} style={{ '--x': `${s.x}%`, '--y': `${s.y}%`, '--d': `${s.d}s`, '--s': `${s.s}px` }} />
          ))}
        </div>
        <div className="lv lv-shoot-wrap"><i className="lv-shoot" /></div>
        <div className="lv lv-glow" />
        <div className="sun" />
        <i className="lv lv-cloud lv-c1" />
        <i className="lv lv-cloud lv-c2" />
        <i className="lv lv-cloud lv-c3" />
        <Flock className="lv-fl1" />
        <Flock className="lv-fl2" />
        <svg className="lv lv-kite" viewBox="0 0 60 150">
          <path d="M30 40 C26 70 36 90 28 150" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1" />
          <path d="M30 6 L48 26 L30 46 L12 26Z" fill="#ff7a59" />
          <path d="M30 6 L48 26 L30 26Z" fill="#ffc66b" />
          <path d="M30 6 V46 M12 26 H48" stroke="rgba(255,255,255,.55)" strokeWidth=".8" />
          <path d="M30 46 q-6 8 0 14 q6 6 0 12" fill="none" stroke="#ffc66b" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <svg className="hills hills-back" viewBox="0 0 1440 300" preserveAspectRatio="none">
          <path fill="var(--hill-back, #1A2352)" opacity=".7" d="M0 150 C240 60 420 200 700 120 C980 40 1180 160 1440 90 V300 H0Z" />
        </svg>
        <svg className="hills hills-front" viewBox="0 0 1440 300" preserveAspectRatio="none">
          <path fill="var(--hill-front, #0B0F2E)" d="M0 220 C200 160 420 250 720 190 C1020 130 1220 240 1440 190 V300 H0Z" />
        </svg>
        <div className="lv lv-motes">
          {MOTES.map((m, i) => (
            <i key={i} style={{ '--x': `${m.x}%`, '--b': `${m.b}%`, '--d': `${m.d}s`, '--t': `${m.t}s` }} />
          ))}
        </div>
      </div>

      <nav className="rail" aria-label="Story chapters">
        {chapters.map((c, i) => (
          <button
            key={c}
            type="button"
            className={active === i ? 'on' : ''}
            onClick={() => go(i)}
            aria-label={`Go to chapter: ${c}`}
            aria-current={active === i ? 'true' : undefined}
          >
            <span>{c}</span>
          </button>
        ))}
      </nav>

      <div className="lv-clock" aria-hidden="true" ref={clockEl}>4:50 am</div>

      <button
        type="button"
        data-play
        className={`btn play-btn ${playing ? 'solid' : 'light'}`}
        onClick={playing ? stop : play}
        aria-pressed={playing}
        aria-label={playing ? 'Pause story' : 'Play story with sound'}
      >
        {playing ? <Pause /> : <Play />}
        <span>{playing ? 'Pause story' : 'Play story'}</span>
      </button>

      {/* 0. Opening */}
      <section id="ch0" data-i="0" className={cls(0, 'intro')}>
        <div className="intro-inner">
          <h1 aria-label={profile.name}>
            <span className="line" aria-hidden="true"><span>Shreya</span></span>
            <span className="line" aria-hidden="true"><span>Sharma</span></span>
          </h1>
          {profile.nameHindi && <p className="lv-hindi" lang="hi" aria-hidden="true">{profile.nameHindi}</p>}
          <p className="intro-sub">
            {profile.roles[0]} and {profile.roles[1]}, from {profile.location}. This is how I got here.
          </p>
          <div className="intro-actions">
            <button type="button" className="btn light" onClick={() => go(1)}>Follow the sun</button>
            <ResumeActions variant="story" />
          </div>
        </div>
        <span className="scroll-hint" aria-hidden="true">Scroll</span>
      </section>

      {/* 1. Education, as a timeline */}
      <section id="ch1" data-i="1" className={cls(1, 'scene')}>
        <div className="scene-inner">
          <Reveal as="h2" variant="mask">First light</Reveal>
          <Reveal as="p" className="lead" delay={80}>
            School in Gandhinagar and Ahmedabad, then university, and in 2026 a second course alongside it.
          </Reveal>
          <ol className="path">
            {timeline.map((e, i) => (
              <Reveal as="li" key={e.title} delay={i * 110}>
                <time>{e.year}</time>
                <b>{e.title}</b>
                <span>{e.place}. {e.notes.join(', ')}.</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 2. Work, with the portrait emerging */}
      <section id="ch2" data-i="2" className={cls(2, 'scene portrait-scene')}>
        <div className="scene-inner">
          <div className="story-frame">
            <Visual
              className="story-portrait"
              src={profile.image}
              focus={profile.imageFocus}
              alt="Portrait of Shreya Sharma"
              label="Portrait"
              hint={profile.imageHint}
            />
          </div>
          <div className="scene-text">
            <Reveal as="h2" variant="mask">Sunrise</Reveal>
            <Reveal as="p" className="lead" delay={80}>
              {experience.role} at {experience.org} for {experience.duration}.
            </Reveal>
            <Reveal as="ul" delay={140} className="plain">
              {experience.points.map((pt) => <li key={pt}>{pt}</li>)}
            </Reveal>
            <Reveal delay={200} className="feature">
              <h3>{projects[0].title}</h3>
              <p>{projects[0].kind}. {projects[0].points[0]}</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 3. Skills, as big typographic words */}
      <section id="ch3" data-i="3" className={cls(3, 'scene')}>
        <div className="scene-inner wide">
          <Reveal as="h2" variant="mask">Daylight</Reveal>
          <Reveal as="p" className="lead" delay={80}>
            What I work with now, and the directions I am growing into: {profile.interests.join(', ').toLowerCase()}.
          </Reveal>
          <ul className="words" aria-label="Technical skills">
            {skills.map((s, i) => (
              <Reveal as="li" key={s} delay={i * 70} variant="fade">{s}</Reveal>
            ))}
          </ul>
          <Reveal as="p" className="strength-line" delay={120}>{strengths.join('  /  ')}</Reveal>
          <Reveal as="p" className="small" delay={160}>
            Side projects: {sideProjects.map((p) => p.title).join(', ')}. Certificates: {certificates.join(', ')}. Languages: {languages.join(' and ')}.
          </Reveal>
        </div>
      </section>

      {/* 4. Ending */}
      <section id="ch4" data-i="4" className={cls(4, 'scene finale')}>
        <div className="scene-inner">
          <Reveal as="h2" variant="mask">Golden hour</Reveal>
          <Reveal as="p" className="lead" delay={80}>
            If you have a project that needs a developer who also keeps things on schedule, write to me.
          </Reveal>
          <Reveal delay={140}>
            <a className="mail" href={`mailto:${profile.email}`}>{profile.email}</a>
            {hasPhone && (
              <p className="phone"><a href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a></p>
            )}
            <ResumeActions variant="story" />
            <div className="finale-actions">
              <button type="button" className="btn solid" onClick={onWebsite}>Open the website</button>
              <button
                type="button"
                className="btn ghost-light"
                onClick={() => {
                  stop()
                  window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' })
                }}
              >
                Back to the start
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}