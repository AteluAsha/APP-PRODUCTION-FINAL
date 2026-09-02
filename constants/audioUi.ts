/** Earth-tone green rim: this sanctuary track is saved and ready to play. */
export const AUDIO_READY_RIM = '#7A9A72'

export const AUDIO_IDLE_RIM = 'rgba(255,255,255,0.38)'

/** Course master meditation + library row highlight when vaulted. */
export const SANCTUARY_READY_BORDER = '#C5E0B4'
export const SANCTUARY_IDLE_BORDER = '#D4C4A8'
export const SANCTUARY_READY_GLOW = '#C5E0B4'
export const SANCTUARY_IDLE_GLOW = '#E8C98C'

export function audioReadyBorderColor(isReady: boolean): string {
    return isReady ? AUDIO_READY_RIM : AUDIO_IDLE_RIM
}

export function sanctuaryReadyFrameStyle(isReady: boolean) {
    return {
        borderWidth: isReady ? 2.5 : 1,
        borderColor: isReady ? SANCTUARY_READY_BORDER : 'rgba(255,255,255,0.16)',
        shadowColor: isReady ? SANCTUARY_READY_GLOW : SANCTUARY_IDLE_GLOW,
        shadowOpacity: isReady ? 0.35 : 0.22,
        shadowRadius: isReady ? 10 : 8,
        shadowOffset: { width: 0, height: 2 as const },
        elevation: isReady ? 6 : 4,
    }
}
