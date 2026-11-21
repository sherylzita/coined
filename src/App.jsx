import { useEffect, useMemo, useRef, useState } from 'react'
import { formatLongDate } from './daily.js'
import { puzzleFor, shopLabel, stemById } from './puzzles.js'
import { evaluatePuzzle, shareText } from './score.js'
import { loadState, recordImpression, todayKey } from './storage.js'

const GROUPS = [
  ['prefix', 'Prefixes'],
  ['root', 'Roots'],
  ['suffix', 'Suffixes'],
]

const today = new Date()
const puzzle = puzzleFor(today)
const todayId = todayKey()

export default function App() {
  const saved = useMemo(() => loadState(), [])
  const savedIds = saved.impressions[todayId]?.ids
  const initialIds = Array.isArray(savedIds) ? savedIds.filter((id) => stemById(id)) : []

  const [order, setOrder] = useState(initialIds)
  const [justAdded, setJustAdded] = useState(null)
  const [phase, setPhase] = useState(initialIds.length >= 2 ? 'struck' : 'idle')
  const [result, setResult] = useState(() =>
    initialIds.length >= 2 ? evaluatePuzzle(initialIds, puzzle) : null,
  )
  const [streak, setStreak] = useState(saved.streak || 0)
  const [record, setRecord] = useState(saved)
  const [pull, setPull] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  const pullRef = useRef(0)
  const timer = useRef(null)
  const mountRef = useRef(null)
  const dragFrom = useRef(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduceMotion(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => {
      media.removeEventListener('change', apply)
      clearTimeout(timer.current)
    }
  }, [])

  const selected = new Set(order)
  const full = order.length >= 4
  const dirty = result && phase !== 'striking' && result.ids.join('|') !== order.join('|')
  const status =
    note ||
    (phase === 'striking'
      ? 'The screw is coming down.'
      : dirty
        ? 'The stick no longer matches the coin. Strike again.'
        : 'Pull the lever through to strike.')

  function addStem(id) {
    if (selected.has(id) || full || phase === 'striking') return
    setOrder((current) => [...current, id])
    setJustAdded(id)
    setNote('')
  }

  function removeAt(index) {
    if (phase === 'striking') return
    setOrder((current) => current.filter((_, i) => i !== index))
  }

  function move(index, direction) {
    setOrder((current) => {
      const next = index + direction
      if (next < 0 || next >= current.length) return current
      const copy = [...current]
      const [item] = copy.splice(index, 1)
      copy.splice(next, 0, item)
      return copy
    })
  }

  function returnAll() {
    if (phase === 'striking') return
    setOrder([])
  }

  function updatePull(clientY) {
    const rect = mountRef.current?.getBoundingClientRect()
    if (!rect) return
    const value = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
    pullRef.current = value
    setPull(value)
  }

  function attemptStrike() {
    if (phase === 'striking') return
    if (order.length < 2) {
      setNote('The die wants at least two sorts.')
      setPhase('clunk')
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setPhase('idle'), 420)
      return
    }

    const impression = evaluatePuzzle(order, puzzle)
    const nextRecord = recordImpression(record, todayId, order)
    setRecord(nextRecord)
    setStreak(nextRecord.streak)
    setNote('')
    setCopied(false)

    if (reduceMotion) {
      setResult(impression)
      setPhase('struck')
      return
    }

    setPhase('striking')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setResult(impression)
      setPhase('struck')
    }, 880)
  }

  function onLeverDown(event) {
    if (phase === 'striking') return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
    updatePull(event.clientY)
  }

  function onLeverMove(event) {
    if (!dragging) return
    updatePull(event.clientY)
  }

  function onLeverUp() {
    if (!dragging) return
    const value = pullRef.current
    setDragging(false)
    pullRef.current = 0
    setPull(0)
    if (value >= 0.72) attemptStrike()
  }

  function onLeverKey(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    if (reduceMotion) {
      attemptStrike()
      return
    }
    setPull(1)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setPull(0)
      attemptStrike()
    }, 160)
  }

  async function copySlip() {
    if (!result) return
    const text = shareText({
      number: puzzle.number,
      word: result.word,
      fit: result.fit,
      grammar: result.grammar,
      flow: result.flow,
      total: result.total,
      streak,
    })
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setNote('')
    } catch {
      setCopied(false)
      setNote('The slip would not copy from this browser.')
    }
  }

  useEffect(() => {
    if (!copied) return undefined
    const id = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(id)
  }, [copied])

  return (
    <div className={`desk ${dragging ? 'is-pulling' : ''} ${phase === 'striking' || phase === 'clunk' ? 'is-thump' : ''}`}>
      <header className="mast">
        <div>
          <p className="eyebrow">A daily word for an unnamed feeling</p>
          <h1 className="wordmark">Coined</h1>
        </div>
        <div className="mast-meta">
          <p>
            No. {puzzle.number}
            <span> · {formatLongDate(today)}</span>
          </p>
          <div className="streak-coin" aria-label={`Streak of ${streak} day${streak === 1 ? '' : 's'}`}>
            <span>{streak}</span>
            <small>Streak</small>
          </div>
        </div>
      </header>

      <main className="bench">
        <section className="sheet" aria-label="Today's brief">
          <p className="sheet-kicker">Today&apos;s brief</p>
          <p className="typed">{puzzle.text}</p>
          <p className="sheet-foot">Set two to four sorts. The plate on the press prefers prefix, root, suffix.</p>
        </section>

        <Press
          mountRef={mountRef}
          pull={pull}
          dragging={dragging}
          phase={phase}
          result={result}
          note={status}
          copied={copied}
          reduceMotion={reduceMotion}
          onLeverDown={onLeverDown}
          onLeverMove={onLeverMove}
          onLeverUp={onLeverUp}
          onLeverKey={onLeverKey}
          onCopy={copySlip}
        />

        <section className="stick-wrap" aria-label="Composing stick">
          <div className="stick-head">
            <h2>Composing stick</h2>
            <button type="button" className="text-button" onClick={returnAll} disabled={order.length === 0 || phase === 'striking'}>
              Return all
            </button>
          </div>
          <div className="stick" aria-live="polite">
            {order.length === 0 && <p className="stick-empty">The stick is empty.</p>}
            {order.map((id, index) => {
              const stem = stemById(id)
              return (
                <button
                  key={`${id}-${index}`}
                  type="button"
                  className={`sort sort-set ${justAdded === id ? 'is-snap' : ''}`}
                  draggable={phase !== 'striking'}
                  aria-label={`${shopLabel(stem)}, ${stem.gloss}. Position ${index + 1} of ${order.length}. Click to return it to the tray. Arrow keys reorder.`}
                  onClick={() => {
                    if (dragFrom.current != null) return
                    removeAt(index)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowLeft') {
                      event.preventDefault()
                      move(index, -1)
                    }
                    if (event.key === 'ArrowRight') {
                      event.preventDefault()
                      move(index, 1)
                    }
                    if (event.key === 'Backspace' || event.key === 'Delete') {
                      event.preventDefault()
                      removeAt(index)
                    }
                  }}
                  onDragStart={() => {
                    dragFrom.current = index
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault()
                    const from = dragFrom.current
                    dragFrom.current = null
                    if (from == null || from === index) return
                    setOrder((current) => {
                      const copy = [...current]
                      const [item] = copy.splice(from, 1)
                      copy.splice(index, 0, item)
                      return copy
                    })
                  }}
                  onDragEnd={() => {
                    setTimeout(() => {
                      dragFrom.current = null
                    }, 0)
                  }}
                >
                  <strong>{shopLabel(stem)}</strong>
                  <em>{stem.gloss}</em>
                </button>
              )
            })}
          </div>
        </section>

        <section className="tray" aria-label="Typesetter's tray">
          <div className="tray-rail">
            <h2>Case</h2>
            <p>{full ? 'Four sorts. Return one before taking another.' : 'Take a sort. It leaves its pocket.'}</p>
          </div>
          {GROUPS.map(([kind, label]) => {
            const stems = puzzle.tray
              .map(stemById)
              .filter((stem) => stem && stem.kind === kind)
              .sort((a, b) => a.form.localeCompare(b.form))
            return (
              <div key={kind} className="tray-group">
                <h3>{label}</h3>
                <div className="tray-grid">
                  {stems.map((stem) => {
                    const taken = selected.has(stem.id)
                    const locked = full && !taken
                    return (
                      <button
                        key={stem.id}
                        type="button"
                        className={`pocket ${taken ? 'is-empty' : ''} ${locked ? 'is-locked' : ''}`}
                        onClick={() => addStem(stem.id)}
                        disabled={taken || locked || phase === 'striking'}
                        aria-pressed={taken}
                      >
                        {taken ? (
                          <span className="pocket-ghost">{shopLabel(stem)}</span>
                        ) : (
                          <span className="sort">
                            <strong>{shopLabel(stem)}</strong>
                            <em>{stem.gloss}</em>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>
      </main>
    </div>
  )
}

function Press({
  mountRef,
  pull,
  dragging,
  phase,
  result,
  note,
  copied,
  reduceMotion,
  onLeverDown,
  onLeverMove,
  onLeverUp,
  onLeverKey,
  onCopy,
}) {
  const showWord = result && phase !== 'striking'
  const wordSize = result ? `${Math.max(0.78, Math.min(1.28, 16 / Math.max(result.word.length, 8)))}rem` : undefined

  return (
    <section className="press" aria-label="Coin press">
      <div className={`press-frame ${phase === 'striking' ? 'is-striking' : ''} ${phase === 'clunk' ? 'is-clunk' : ''}`}>
        <span className="screw screw-tl" />
        <span className="screw screw-tr" />
        <span className="screw screw-bl" />
        <span className="screw screw-br" />
        <p className="plate">Prefix · Root · Suffix</p>
        <div className="yoke">
          <div
            className={`ram ${phase === 'striking' && !reduceMotion ? 'is-striking' : ''}`}
            style={dragging ? { transform: `translateY(${pull * 22}px)` } : undefined}
          >
            <span className="ram-shaft" />
            <span className="ram-head" />
          </div>
          <div className="collar">
            <div className={`flan ${showWord ? 'is-minted' : ''} ${phase === 'striking' && !reduceMotion ? 'is-striking' : ''}`}>
              <span className="flan-word" style={{ fontSize: wordSize }}>
                {showWord ? result.word : ''}
              </span>
            </div>
          </div>
          <div className="anvil" />
        </div>
        <div className="lever-mount" ref={mountRef}>
          <button
            type="button"
            className={`lever ${dragging ? 'is-dragging' : ''}`}
            style={{ transform: `rotate(${pull * 74}deg)` }}
            aria-label="Coin press lever. Pull down to strike the word."
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pull * 100)}
            role="slider"
            onPointerDown={onLeverDown}
            onPointerMove={onLeverMove}
            onPointerUp={onLeverUp}
            onPointerCancel={onLeverUp}
            onKeyDown={onLeverKey}
          >
            <span className="lever-arm" />
            <span className="lever-grip" />
          </button>
        </div>
      </div>

      <p className="press-note" aria-live="polite">
        {note}
      </p>

      {showWord && (
        <article className="slip" aria-live="polite">
          <p className="slip-kicker">Impression</p>
          <p className="slip-total">
            <span>{result.total}</span>
            <small>/100</small>
          </p>
          <p className="slip-verdict">{result.verdict}</p>
          <p className="slip-gloss">{result.parts.map((part) => `${part.label} ${part.gloss}`).join('  ·  ')}</p>
          <Meter label="Fit" score={result.fit} line={result.fitLine} />
          <Meter label="Grammar" score={result.grammar} line={result.grammarLine} />
          <Meter label="Flow" score={result.flow} line={result.flowLine} />
          <p className="slip-share" aria-hidden="true">
            {shareBlocks(result)}
          </p>
          <button type="button" className="brass-button" onClick={onCopy}>
            {copied ? 'Copied' : 'Copy the slip'}
          </button>
        </article>
      )}
    </section>
  )
}

function Meter({ label, score, line }) {
  return (
    <div className="meter">
      <div className="meter-top">
        <span>{label}</span>
        <span>{score}</span>
      </div>
      <div className="meter-track" aria-hidden="true">
        <span style={{ width: `${score}%` }} />
      </div>
      <p>{line}</p>
    </div>
  )
}

function shareBlocks(result) {
  const block = (score) => (score >= 70 ? '🟩' : score >= 45 ? '🟨' : '⬛')
  return `${block(result.fit)}${block(result.grammar)}${block(result.flow)}`
}
