const options = [
  ['website', 'Website'],
  ['story', 'Story'],
]

export default function ModeSwitch({ mode, onChange }) {
  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') onChange('story')
    if (e.key === 'ArrowLeft') onChange('website')
  }

  return (
    <div
      className="switch"
      role="group"
      aria-label="Choose how to view this portfolio"
      data-mode={mode}
      onKeyDown={onKeyDown}
    >
      <span className="switch-thumb" aria-hidden="true" />
      {options.map(([id, label]) => (
        <button key={id} type="button" aria-pressed={mode === id} onClick={() => onChange(id)}>
          {label}
        </button>
      ))}
    </div>
  )
}