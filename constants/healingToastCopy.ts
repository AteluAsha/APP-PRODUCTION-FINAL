/** Gentle UX copy for transient healing toasts — never alarming. */
export const HEALING_TOAST = {
    gatheringPresence: 'Gathering presence… take a breath.',
    playerWhenReady: 'Player will open when ready.',
    stillGathering: 'Still gathering… one moment.',
    openingPlayer: 'Opening your sanctuary player.',
    downloadQueued: 'Saving for offline healing…',
    downloadAll: 'Downloading missing tracks for you.',
    alreadyDownloaded: 'Already on your device.',
    notesCopied: 'Copied. These stay yours.',
    thoughtCopied: 'Thought copied.',
    profileSaved: 'Your presence is saved.',
    oneAtATime: 'One healing track at a time.',
} as const

export type HealingToastKey = keyof typeof HEALING_TOAST
