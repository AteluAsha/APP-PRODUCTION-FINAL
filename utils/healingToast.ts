import {
    HEALING_TOAST,
    type HealingToastKey,
} from '@/constants/healingToastCopy'
import { useHealingToastStore } from '@/hooks/useHealingToastStore'

export function showHealingToast(
    messageOrKey: string | HealingToastKey,
    opts?: { durationMs?: number; key?: string },
): void {
    const message =
        messageOrKey in HEALING_TOAST
            ? HEALING_TOAST[messageOrKey as HealingToastKey]
            : messageOrKey
    useHealingToastStore.getState().show(message, {
        ...opts,
        key: opts?.key ?? String(messageOrKey),
    })
}
