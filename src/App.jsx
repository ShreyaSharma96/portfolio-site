import { useState, useRef, useEffect } from 'react'
import Website from './components/Website.jsx'
import Story from './components/Story.jsx'
import ModeSwitch from './components/ModeSwitch.jsx'

const SWAP_AT = 450
const DONE_AT = 1000

export default function App() {
  const [mode, setMode] = useState(() => (window.location.hash === '#story' ? 'story' : 'website'))
  const [veil, setVeil] = useState(null) // target mode while the wipe plays, otherwise null
  const busy = useRef(false)
  const timers = useRef([])

  const swap = (next) => {
    setMode(next)
    const { pathname, search } = window.location
    window.history.replaceState(null, '', next === 'story' ? `${pathname}${search}#story` : `${pathname}${search}`)
    window.scrollTo(0, 0)
  }

  const change = (next) => {
    if (next === mode || busy.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      swap(next)
      return
    }
    busy.current = true
    setVeil(next)
    timers.current = [
      setTimeout(() => swap(next), SWAP_AT),
      setTimeout(() => {
        setVeil(null)
        busy.current = false
      }, DONE_AT),
    ]
  }

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  useEffect(() => {
    document.body.dataset.mode = mode
    document.title =
      mode === 'story'
        ? 'Shreya Sharma | The Story'
        : 'Shreya Sharma | Frontend Developer & Project Coordinator'
  }, [mode])

  return (
    <>
      {mode === 'website' ? (
        <Website onStory={() => change('story')} />
      ) : (
        <Story onWebsite={() => change('website')} />
      )}
      <div className={`veil ${veil ? 'go' : ''}`} data-to={veil || mode} aria-hidden="true" />
      <ModeSwitch mode={mode} onChange={change} />
    </>
  )
}