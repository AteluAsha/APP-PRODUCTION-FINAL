/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import { ANUA_CHAT_ENABLED } from '../constants/anuaAccess'

describe('Anua chat gate', () => {
    it('is restored on a live Gemini 3.6 Flash path', () => {
        expect(ANUA_CHAT_ENABLED).toBe(true)
        const gemini = fs.readFileSync(
            path.join(__dirname, '..', 'src/services/gemini.ts'),
            'utf8',
        )
        expect(gemini).toContain('GoogleGenerativeAI')
        expect(gemini).toContain('gemini-3.6-flash')
        expect(gemini).toContain('generateContentStream')
        expect(gemini).toContain('canUseGeminiStreaming')
        expect(gemini).toContain('permission')
        const menu = fs.readFileSync(
            path.join(
                __dirname,
                '..',
                'components/navigation/PermanentMenuBar.tsx',
            ),
            'utf8',
        )
        expect(menu).toContain('ANUA_CHAT_ENABLED')
        const store = fs.readFileSync(
            path.join(__dirname, '..', 'hooks/useAnuaChatStore.ts'),
            'utf8',
        )
        expect(store).toContain('if (!ANUA_CHAT_ENABLED) return')
    })
})
