// Renders admin-written text with http(s) URLs as links. Built from React
// elements, never HTML strings, so the text itself cannot inject markup.
const URL_PATTERN = /https?:\/\/[^\s<>"]+/g
// Sentence punctuation right after a URL belongs to the sentence, not the link.
const TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/

export default function Linkify({ text }) {
  if (!text) return null

  const parts = []
  let last = 0

  for (const match of text.matchAll(URL_PATTERN)) {
    const url = match[0].replace(TRAILING_PUNCTUATION, '')
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push(
      <a
        key={match.index}
        href={url}
        target='_blank'
        rel='noopener noreferrer nofollow'
        className='underline underline-offset-2 hover:text-white'
      >
        {url}
      </a>
    )
    last = match.index + url.length
  }

  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}
