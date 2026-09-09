/* eslint-env jest */
import fs from 'fs'
import path from 'path'

const root = path.join(__dirname, '..')

function readSrc(rel: string): string {
    return fs.readFileSync(path.join(root, rel), 'utf8')
}

describe('Notes Along the Way chakra selector', () => {
    it('stretches balls across the row instead of a tight horizontal scroll', () => {
        const selector = readSrc('components/chakras/ChakraDaySelector.tsx')
        expect(selector).not.toContain('ScrollView')
        expect(selector).toContain('flex: 1')
        expect(selector).toContain('width: 40')
        expect(selector).toContain('height: 44')
    })

    it('lets a slightly diagonal swipe change days while vertical scroll still wins', () => {
        const notes = readSrc('app/(chakras)/NotesAlongTheWay.tsx')
        expect(notes).toContain('.activeOffsetX(20)')
        expect(notes).toContain('.failOffsetY([-18, 18])')
        expect(notes).toContain('if (prev === 6) return "all"')
        expect(notes).toContain('if (prev === 0) return "all"')
    })

    it('keeps notes intimate: earth cards, Anua by long-press, copy and share', () => {
        const notes = readSrc('app/(chakras)/NotesAlongTheWay.tsx')
        expect(notes).toContain('cormorant-italic')
        expect(notes).toContain('A quiet place for what lands.')
        expect(notes).toContain('These stay on this device.')
        expect(notes).toContain('onLongPress')
        expect(notes).toContain('sitWithAnuaLabel')
        expect(notes).toContain('copyJourneyNotesToClipboard')
        expect(notes).toContain('share-outline')
        expect(notes).not.toContain('Send thought to Anua')
        const leaf = readSrc('components/notes/NotesLeafButton.tsx')
        expect(leaf).toContain('NOTES_LEAF_IVORY')
        expect(leaf).toContain('whisperOnFirstOpen')
        expect(leaf).toContain('withRepeat')
        const player = readSrc('app/AudioPlayer.tsx')
        expect(player).toContain('NotesLeafButton')
        expect(player).toContain('whisperOnFirstOpen')
        expect(player).not.toContain('#87AE73')
        const exportUtil = readSrc('utils/journeyNotesExport.ts')
        expect(exportUtil).toContain('copyJourneyNotesToClipboard')
        expect(exportUtil).toContain('expo-clipboard')
        const menu = readSrc('components/navigation/PermanentMenuBar.tsx')
        expect(menu).toContain('iconSheen')
        expect(menu).toContain('iconGradientFill')
    })
})

describe('Anua concise voice', () => {
    it('opens with a short greeting, not a lecture', () => {
        const chat = readSrc('components/social/AnuaChatModal.tsx')
        expect(chat).toContain("I'm Anua. You're at the threshold of this journey.")
        expect(chat).toContain('greetingText = `I\'m Anua. ${randomQuestion}`')
        expect(chat).not.toContain("I'd love to understand")
        expect(chat).not.toContain('Hello, beautiful soul.')
    })

    it('tells the model to stay short unless the prompt warrants more', () => {
        const gemini = readSrc('src/services/gemini.ts')
        expect(gemini).toContain('LENGTH AND FOCUS')
        expect(gemini).toContain('Do not extend thoughts that were not part of the prompt')
        expect(gemini).toContain('Default: one or two sentences')
    })
})
