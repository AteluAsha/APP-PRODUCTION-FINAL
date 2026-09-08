export type AnuaMarkupSegment = {
    text: string
    italic?: boolean
    bold?: boolean
}

/**
 * Soften star-shouting so the chat can render real italics/bold.
 * ***phrase*** becomes *phrase*; lone *** lines are dropped.
 */
export function normalizeAnuaEmphasis(text: string): string {
    return text
        .replace(/^\s*\*{3,}\s*$/gm, '')
        .replace(/\*{3,}([^*\n]+)\*{3,}/g, '*$1*')
        .replace(/\*{4,}/g, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

/**
 * Hide incomplete * / ** / *** openers while tokens are still arriving
 * so the bubble does not flicker between plain and styled text.
 */
export function stabilizeStreamingMarkup(text: string): string {
    let i = 0
    let out = ''
    while (i < text.length) {
        if (text[i] !== '*') {
            out += text[i]
            i += 1
            continue
        }
        const marker = text.startsWith('***', i)
            ? '***'
            : text.startsWith('**', i)
              ? '**'
              : '*'
        const close = text.indexOf(marker, i + marker.length)
        if (close === -1) {
            out += text.slice(i + marker.length)
            break
        }
        out += text.slice(i, close + marker.length)
        i = close + marker.length
    }
    return out
}

export function parseAnuaMarkup(input: string): AnuaMarkupSegment[] {
    const segments: AnuaMarkupSegment[] = []
    const re = /\*\*\*([^*\n]+)\*\*\*|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*/g
    let last = 0
    let match: RegExpExecArray | null
    while ((match = re.exec(input)) !== null) {
        if (match.index > last) {
            segments.push({ text: input.slice(last, match.index) })
        }
        if (match[1] != null) {
            segments.push({ text: match[1], bold: true, italic: true })
        } else if (match[2] != null) {
            segments.push({ text: match[2], bold: true })
        } else if (match[3] != null) {
            segments.push({ text: match[3], italic: true })
        }
        last = match.index + match[0].length
    }
    if (last < input.length) {
        segments.push({ text: input.slice(last) })
    }
    return segments.length > 0 ? segments : [{ text: input }]
}

export function stripAnuaMarkup(text: string): string {
    return parseAnuaMarkup(normalizeAnuaEmphasis(text))
        .map((segment) => segment.text)
        .join('')
        .replace(/\*+/g, '')
        .replace(/[ \t]+\n/g, '\n')
        .replace(/ {2,}/g, ' ')
        .trim()
}
