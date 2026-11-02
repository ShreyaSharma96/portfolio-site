import { resume } from '../data.js'

const Eye = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 20h14" />
  </svg>
)

// variant: 'site' (light pages), 'dark' (dark sections), 'story' (over the sky)
// compact: icon-only buttons with accessible labels, for tight spaces like the nav
export default function ResumeActions({ variant = 'site', compact = false, className = '' }) {
  return (
    <div className={`resume resume--${variant} ${compact ? 'resume--compact' : ''} ${className}`.trim()}>
      <a className="resume-btn resume-view" href={resume.url} target="_blank" rel="noopener noreferrer" aria-label="View resume (opens in a new tab)">
        <Eye />
        <span>View Resume</span>
      </a>
      <a className="resume-btn resume-download" href={resume.url} download={resume.downloadName} aria-label="Download resume as PDF">
        <Arrow />
        <span>Download Resume</span>
      </a>
    </div>
  )
}