import {
    normalizeAnuaEmphasis,
    parseAnuaMarkup,
    stabilizeStreamingMarkup,
    stripAnuaMarkup,
} from '../utils/anuaMessageMarkup'

describe('anua message markup', () => {
    it('turns triple-star shouting into italics', () => {
        expect(normalizeAnuaEmphasis('This is ***sacred*** ground.')).toBe(
            'This is *sacred* ground.',
        )
    })

    it('drops decorative star lines', () => {
        expect(normalizeAnuaEmphasis('Hello\n***\nStay close.')).toBe(
            'Hello\n\nStay close.',
        )
    })

    it('parses italics and bold for display', () => {
        expect(parseAnuaMarkup('Meet them in the *now*, then **listen**.')).toEqual([
            { text: 'Meet them in the ' },
            { text: 'now', italic: true },
            { text: ', then ' },
            { text: 'listen', bold: true },
            { text: '.' },
        ])
    })

    it('strips markup so voice does not speak asterisks', () => {
        expect(stripAnuaMarkup('Stay in the ***heart***.')).toBe(
            'Stay in the heart.',
        )
    })

    it('hides incomplete emphasis while the stream is still open', () => {
        expect(stabilizeStreamingMarkup('Stay in the *hea')).toBe(
            'Stay in the hea',
        )
        expect(stabilizeStreamingMarkup('Stay in the *heart* now')).toBe(
            'Stay in the *heart* now',
        )
        expect(stabilizeStreamingMarkup('A **key')).toBe('A key')
    })
})
