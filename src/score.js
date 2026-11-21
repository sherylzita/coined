import { shopLabel, stemById } from './puzzles.js'

export function mint(stems) {
  let word = ''
  for (const stem of stems) {
    let bit = stem.form
    if (word && bit && word.at(-1) === bit[0] && 'aeiou'.includes(bit[0])) {
      bit = bit.slice(1)
    }
    word += bit
  }
  return word
}

export function evaluatePuzzle(ids, puzzle) {
  const stems = ids.map(stemById).filter(Boolean)
  const word = mint(stems)
  const fit = scoreFit(stems, puzzle.themes)
  const grammar = scoreGrammar(stems)
  const flow = scoreFlow(word)
  const hasRoot = stems.some((stem) => stem.kind === 'root')

  let total = fit.score
  total -= Math.max(0, 94 - grammar.score) * 0.7
  total += Math.max(0, grammar.score - 94) * 0.08
  total -= Math.max(0, 80 - flow.score) * 0.45
  total += Math.max(0, flow.score - 80) * 0.2
  if (!hasRoot) total -= 8
  total = clamp(Math.round(total))

  return {
    ids,
    word,
    parts: stems.map((stem) => ({ label: shopLabel(stem), gloss: stem.gloss })),
    fit: fit.score,
    grammar: grammar.score,
    flow: flow.score,
    total,
    fitLine: fit.line,
    grammarLine: grammar.line,
    flowLine: flow.line,
    verdict: verdictFor(total),
  }
}

function scoreFit(stems, themes) {
  const content = stems.filter((stem) => stem.kind !== 'suffix')
  if (content.length === 0) {
    return { score: 12, line: 'Endings alone cannot name the feeling.' }
  }

  const hits = []
  const misses = []
  const covered = new Set()
  let acc = 0

  for (const stem of content) {
    const overlap = stem.themes.filter((theme) => themes.includes(theme))
    if (overlap.length) {
      hits.push(stem)
      overlap.forEach((theme) => covered.add(theme))
      acc += Math.min(1, 0.72 + (overlap.length - 1) * 0.14)
    } else {
      misses.push(stem)
      acc += 0.04
    }
  }

  let score = (acc / content.length) * 100
  if (misses.length === 0 && covered.size >= 3) score += 8
  else if (covered.size >= 4) score += 4

  return { score: clamp(Math.round(score)), line: fitLine(hits, misses) }
}

function fitLine(hits, misses) {
  const name = (list) => list.map((stem) => stem.form).join(', ')
  if (hits.length === 0) return 'None of these sorts are about this hour.'
  if (misses.length === 0) return 'Every sort on the stick answers the brief.'
  return `${name(hits)} meet the brief. ${name(misses)} ${misses.length === 1 ? 'wanders' : 'wander'}.`
}

function scoreGrammar(stems) {
  const roots = stems.filter((stem) => stem.kind === 'root').length
  let score = 100
  let line = 'The sorts keep classical order.'

  if (roots === 0) {
    score -= 64
    line = 'There is no root on the stick, so the coin has no body.'
  } else if (roots >= 3) {
    score -= 8
    line = 'Three roots is a crowd for a coin this small.'
  }

  let phase = 0
  let disorder = false
  for (const stem of stems) {
    const rank = stem.kind === 'prefix' ? 0 : stem.kind === 'root' ? 1 : 2
    if (rank < phase) disorder = true
    else phase = rank
  }

  if (disorder) {
    score -= 42
    line = 'A sort has climbed out of order. Prefix, then root, then suffix.'
  }

  return { score: clamp(score), line }
}

function scoreFlow(word) {
  if (!word) return { score: 0, line: 'The die is empty.' }

  let score = 70
  if (word.length >= 8 && word.length <= 16) score += 14
  else if (word.length <= 6) score -= 18
  else if (word.length >= 20) score -= 16
  else if (word.length >= 17) score -= 8

  const vowels = (word.match(/[aeiou]/g) || []).length
  const ratio = vowels / word.length
  if (ratio >= 0.3 && ratio <= 0.52) score += 8
  else score -= 12

  let jammed = false
  if (/[^aeiou]{4,}/.test(word)) {
    score -= 18
    jammed = true
  }
  if (/(.)\1\1/.test(word)) score -= 10
  if (/[aeiou]{4,}/.test(word)) score -= 8
  if (/(ia|ence|ous|ment|al|ary|ism|itude)$/.test(word)) score += 6

  let line = 'It can be said in one breath, with a little effort.'
  if (jammed) line = 'The consonants jam where the sorts meet.'
  else if (score >= 88) line = 'The joins breathe.'
  else if (score < 68) line = 'The mouth trips on it.'

  return { score: clamp(Math.round(score)), line }
}

function verdictFor(total) {
  if (total >= 90) return 'The metal took the word as if it had been waiting.'
  if (total >= 80) return 'A legitimate coin. It rings.'
  if (total >= 68) return 'The press accepts it, with a small complaint.'
  if (total >= 50) return 'Minted. The sense only partly answers the brief.'
  return 'A slug. Pretty metal, and not yet a word for this hour.'
}

export function shareText({ number, word, fit, grammar, flow, total, streak }) {
  return [
    `Coined #${number}`,
    word,
    `${block(fit)}${block(grammar)}${block(flow)}`,
    `${total}/100 · streak ${streak}`,
  ].join('\n')
}

function block(score) {
  if (score >= 70) return '🟩'
  if (score >= 45) return '🟨'
  return '⬛'
}

function clamp(n) {
  return Math.max(0, Math.min(100, n))
}
