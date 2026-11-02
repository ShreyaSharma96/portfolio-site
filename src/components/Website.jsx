import { useEffect, useRef, useState } from 'react'
import { profile, experience, projects, education, skills, strengths, certificates, languages, cybersecurity } from '../data.js'
import Visual from './Visual.jsx'
import Reveal from './Reveal.jsx'
import ResumeActions from './ResumeActions.jsx'

const links = [
  ['about', 'About'],
  ['work', 'Work'],
  ['experience', 'Experience'],
  ['skills', 'Skills'],
  ['education', 'Education'],
  ['contact', 'Contact'],
]

const titleLinkStyle = {
  color: 'inherit',
  textDecoration: 'underline',
  textDecorationColor: 'var(--sun)',
  textDecorationThickness: '3px',
  textUnderlineOffset: '6px',
}

const External = () => (
  <svg
    viewBox="0 0 24 24"
    width="0.55em"
    height="0.55em"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ marginLeft: '.35em', verticalAlign: '.35em' }}
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
)

export default function Website({ onStory }) {
  const root = useRef(null)
  const portrait = useRef(null)
  const [active, setActive] = useState('')
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Scroll progress for the nav line, and a gentle drift for the hero sun.
  useEffect(() => {
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    const update = () => {
      frame = 0
      const el = root.current
      if (!el) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      el.style.setProperty('--prog', max > 0 ? (window.scrollY / max).toFixed(4) : '0')
      if (!calm) el.style.setProperty('--drift', `${Math.min(window.scrollY, 900) * 0.18}px`)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  // Highlight the nav link of the section in the middle of the screen.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    )
    links.forEach(([id]) => {
      const node = document.getElementById(id)
      if (node) io.observe(node)
    })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Portrait follows the mouse a little. Touch and pen input are ignored.
  const tilt = (e) => {
    if (e.pointerType !== 'mouse' || !portrait.current) return
    const r = e.currentTarget.getBoundingClientRect()
    portrait.current.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3))
    portrait.current.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3))
  }
  const settle = () => {
    portrait.current?.style.setProperty('--px', '0')
    portrait.current?.style.setProperty('--py', '0')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  return (
    <div className="site" ref={root}>
      <header className="nav">
        <a className="logo" href="#top" onClick={() => setOpen(false)}>
          <i /> Shreya Sharma
        </a>
        <nav className="nav-links" aria-label="Sections">
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? 'on' : ''} aria-current={active === id ? 'true' : undefined}>
              {label}
            </a>
          ))}
        </nav>
        <ResumeActions variant="site" compact className="nav-resume" />
        <button
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <span className="nav-line" aria-hidden="true" />
      </header>

      <div id="menu" className={`menu ${open ? 'open' : ''}`} hidden={!open}>
        <nav aria-label="Sections (menu)">
          {links.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setOpen(false)} className={active === id ? 'on' : ''}>
              {label}
            </a>
          ))}
        </nav>
        <ResumeActions variant="site" />
      </div>

      <main id="top">
        <section className="hero wrap" onPointerMove={tilt} onPointerLeave={settle}>
          <div className="hero-copy">
            <h1 aria-label={profile.name}>
              <span className="line" aria-hidden="true"><span>Shreya</span></span>
              <span className="line" aria-hidden="true"><span>Sharma</span></span>
            </h1>
            <p className="roles">{profile.roles.join(', ')}</p>
            <p className="lede">{profile.summary}</p>
            <div className="actions">
              <a className="btn solid" href="#work">See my work</a>
              <a className="btn" href="#contact">Get in touch</a>
              <button type="button" className="btn ghost" onClick={onStory}>Watch the story</button>
            </div>
            <ResumeActions variant="site" className="hero-resume" />
          </div>
          <div className="portrait" ref={portrait}>
            <div className="sun-disc" aria-hidden="true" />
            <Visual
              className="arch"
              src={profile.image}
              focus={profile.imageFocus}
              eager
              alt="Portrait of Shreya Sharma"
              label="Portrait"
              hint={profile.imageHint}
            />
          </div>
        </section>

        <section id="about" className="wrap about">
          <Reveal as="h2" variant="mask">I like projects that run on clarity.</Reveal>
          <Reveal delay={100}>
            <p>{profile.about}</p>
            <ul className="interests" aria-label="Interests">
              {profile.interests.map((s) => <li key={s}>{s}</li>)}
            </ul>
            <ul className="strengths" aria-label="Strengths">
              {strengths.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </Reveal>
        </section>

        <section id="work" className="wrap work">
          <Reveal as="h2" variant="mask">Selected work</Reveal>
          <div className="projects">
            {projects.map((p, i) => (
              <Reveal as="article" key={p.title} delay={i * 120} className={`project ${i === 0 ? 'big' : ''}`}>
                <Visual src={p.image} alt={`${p.title} preview`} label={`${p.title} preview`} hint={p.imageHint} />
                <div>
                  <h3>
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={titleLinkStyle}
                        aria-label={`${p.title} (opens in a new tab)`}
                      >
                        {p.title}
                        <External />
                      </a>
                    ) : (
                      p.title
                    )}
                  </h3>
                  <p className="kind">{p.kind}</p>
                  <ul>{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="experience" className="wrap split">
          <Reveal as="h2" variant="mask">Experience</Reveal>
          <Reveal className="job" delay={100}>
            <h3>{experience.role}</h3>
            <p className="kind">{experience.org} &nbsp;|&nbsp; {experience.duration}</p>
            <ul>{experience.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
          </Reveal>
        </section>

        <section id="skills" className="wrap split">
          <Reveal as="h2" variant="mask">Skills & credentials</Reveal>
          <Reveal className="stack" delay={100}>
            <div>
              <h3>Technical skills</h3>
              <ul className="chips">{skills.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
            <div>
              <h3>Certificates</h3>
              <ul className="chips soft">{certificates.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
            <div>
              <h3>Cybersecurity Skills</h3>
              <ul className="chips soft">{cybersecurity.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
            <div>
              <h3>Languages</h3>
              <ul className="chips soft">{languages.map((s) => <li key={s}>{s}</li>)}</ul>
            </div>
          </Reveal>
        </section>

        <section id="education" className="wrap split">
          <Reveal as="h2" variant="mask">Education</Reveal>
          <ol className="edu">
            {education.map((e, i) => (
              <Reveal as="li" key={e.title} delay={i * 90} className={i < 2 ? 'current' : ''}>
                <time>{e.year}</time>
                <div>
                  <h3>{e.title}</h3>
                  <p className="kind">{e.place}</p>
                  <p className="notes">{e.notes.join('  /  ')}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>

        <section id="contact" className="contact">
          <div className="wrap">
            <Reveal as="h2" variant="mask">Let&rsquo;s build something that works.</Reveal>
            <Reveal delay={100}>
              <a className="mail" href={`mailto:${profile.email}`}>{profile.email}</a>
              <div className="actions">
                <button type="button" className="btn solid" onClick={copy}>
                  {copied ? 'Email copied' : 'Copy email'}
                </button>
                {/* <a className="btn light" href={`tel:${profile.phone.replace(/\s/g, '')}`}>{profile.phone}</a> */}
                <span className="where">{profile.location}</span>
              </div>
              <ResumeActions variant="dark" className="contact-resume" />
            </Reveal>
          </div>
        </section>
      </main>
      <footer className="foot">&copy; {new Date().getFullYear()} Shreya Sharma</footer>
    </div>
  )
}
