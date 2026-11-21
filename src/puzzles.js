/** Classical sorts. `form` is what the press stamps; gloss is the shop label. */
const stem = (kind, form, gloss, themes) => ({ kind, form, gloss, themes })

export const STEMS = {
  semi: stem('prefix', 'semi', 'half', ['halfway', 'partial']),
  sub: stem('prefix', 'sub', 'under', ['below', 'hidden']),
  retro: stem('prefix', 'retro', 'backward', ['memory', 'return']),
  hyper: stem('prefix', 'hyper', 'overmuch', ['sudden', 'excess']),
  mis: stem('prefix', 'mis', 'wrongly', ['mistake', 'guilt']),
  de: stem('prefix', 'de', 'undo', ['undo', 'removal']),
  peri: stem('prefix', 'peri', 'around', ['circle', 'edge']),
  post: stem('prefix', 'post', 'after', ['after', 'end']),
  pre: stem('prefix', 'pre', 'before', ['before']),
  auto: stem('prefix', 'auto', 'self', ['self']),
  uni: stem('prefix', 'uni', 'one', ['single']),
  inter: stem('prefix', 'inter', 'between', ['between']),

  claus: stem('root', 'claus', 'shut, lock', ['door', 'lock']),
  scal: stem('root', 'scal', 'stair, ladder', ['stairs']),
  grad: stem('root', 'grad', 'step', ['stairs', 'step']),
  phob: stem('root', 'phob', 'fear', ['fear']),
  mem: stem('root', 'mem', 'memory', ['memory']),
  laps: stem('root', 'laps', 'slip', ['sudden', 'mistake']),
  crypt: stem('root', 'crypt', 'hidden', ['hidden', 'below']),
  culp: stem('root', 'culp', 'guilt', ['guilt']),
  macul: stem('root', 'macul', 'stain', ['stain', 'guilt']),
  pocul: stem('root', 'pocul', 'cup', ['cup']),
  libr: stem('root', 'libr', 'book', ['book']),
  circul: stem('root', 'circul', 'ring', ['circle', 'look']),
  vestig: stem('root', 'vestig', 'trace', ['trace', 'memory']),
  script: stem('root', 'script', 'writing', ['writing']),
  graph: stem('root', 'graph', 'mark, write', ['writing', 'mark']),
  man: stem('root', 'man', 'hand', ['hand']),
  not: stem('root', 'not', 'a mark', ['mark', 'writing']),
  fin: stem('root', 'fin', 'end', ['end']),
  cant: stem('root', 'cant', 'sing', ['song']),
  son: stem('root', 'son', 'sound', ['song']),
  tac: stem('root', 'tac', 'silence', ['silence']),
  mor: stem('root', 'mor', 'custom', ['politeness', 'custom']),
  dom: stem('root', 'dom', 'house', ['house', 'room', 'home']),
  calor: stem('root', 'calor', 'heat', ['warmth']),
  gel: stem('root', 'gel', 'cold', ['cold']),
  fort: stem('root', 'fort', 'luck', ['luck']),
  phar: stem('root', 'phar', 'beacon', ['light', 'tower']),
  luc: stem('root', 'luc', 'light', ['light']),
  turr: stem('root', 'turr', 'tower', ['tower']),
  mar: stem('root', 'mar', 'sea', ['sea']),
  und: stem('root', 'und', 'wave', ['sea']),
  vacu: stem('root', 'vacu', 'empty', ['empty']),
  spec: stem('root', 'spec', 'look', ['look']),
  tum: stem('root', 'tum', 'swagger', ['pride']),

  ia: stem('suffix', 'ia', 'a condition', []),
  ence: stem('suffix', 'ence', 'a state', []),
  itude: stem('suffix', 'itude', 'a quality', []),
  ment: stem('suffix', 'ment', 'a result', []),
  ous: stem('suffix', 'ous', 'full of', []),
  ary: stem('suffix', 'ary', 'of the kind', []),
  ism: stem('suffix', 'ism', 'a practice', []),
  al: stem('suffix', 'al', 'having the nature', []),
}

const brief = (text, themes, tray) => ({ text, themes, tray })

export const PUZZLES = [
  brief(
    'The strained courtesy of letting a song end in a room that has already agreed the evening is over.',
    ['politeness', 'song', 'end', 'silence', 'room', 'custom', 'after'],
    ['post', 'pre', 'inter', 'mis', 'fin', 'cant', 'tac', 'mor', 'son', 'dom', 'calor', 'scal', 'ence', 'itude', 'ary', 'al'],
  ),
  brief(
    'The private luck of finding one warm stair in a house that has otherwise given itself over to winter.',
    ['warmth', 'stairs', 'cold', 'single', 'luck', 'house', 'step'],
    ['uni', 'semi', 'sub', 'hyper', 'calor', 'gel', 'scal', 'grad', 'dom', 'fort', 'luc', 'mar', 'mem', 'ia', 'ment', 'al', 'ous', 'ence'],
  ),
  brief(
    'The vanity of a lighthouse still raking an empty bay long after the last boat learned the rocks by heart.',
    ['pride', 'light', 'tower', 'sea', 'empty', 'look', 'excess', 'after', 'circle'],
    ['hyper', 'post', 'sub', 'mis', 'phar', 'luc', 'turr', 'mar', 'und', 'vacu', 'spec', 'tum', 'circul', 'cant', 'ia', 'ism', 'ous', 'al'],
  ),
  brief(
    'The small guilt of a coffee-cup ring blooming on the flyleaf of a book you promised to return unscarred.',
    ['guilt', 'stain', 'cup', 'book', 'circle', 'mark'],
    ['mis', 'de', 'peri', 'uni', 'culp', 'macul', 'pocul', 'libr', 'circul', 'vestig', 'not', 'cant', 'ia', 'ment', 'ary', 'ous', 'al'],
  ),
  brief(
    'The sudden dread of realizing you forgot to lock the basement door while halfway up the stairs.',
    ['fear', 'memory', 'door', 'below', 'stairs', 'halfway', 'sudden', 'home', 'mistake', 'lock', 'hidden', 'step'],
    ['semi', 'sub', 'retro', 'hyper', 'mis', 'claus', 'scal', 'grad', 'phob', 'mem', 'laps', 'crypt', 'mar', 'cant', 'ia', 'ence', 'ous', 'al'],
  ),
  brief(
    'The jolt of recognizing your own handwriting in the margin of a library book you cannot remember reading.',
    ['memory', 'writing', 'hand', 'book', 'self', 'sudden', 'mark', 'trace'],
    ['auto', 'retro', 'hyper', 'mis', 'mem', 'graph', 'script', 'man', 'libr', 'not', 'vestig', 'phob', 'gel', 'ia', 'al', 'ary', 'ment'],
  ),
]

export function puzzleFor(date) {
  const number = dayOfYear(date)
  const puzzle = PUZZLES[number % PUZZLES.length]
  return { ...puzzle, number }
}

export function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1)
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.round((target - start) / 86400000) + 1
}

export function stemById(id) {
  const stem = STEMS[id]
  return stem ? { id, ...stem } : null
}

export function shopLabel(stem) {
  if (stem.kind === 'prefix') return `${stem.form}-`
  if (stem.kind === 'suffix') return `-${stem.form}`
  return stem.form
}
