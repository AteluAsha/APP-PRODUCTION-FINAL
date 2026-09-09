export const formatTime = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

/** Whole minutes for audio buttons. Never mm:ss — that belongs on AudioPlayer. */
export const getMinutesString = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  if (minutes >= 1) {
    return `${minutes} min`
  }
  return "1 min"
}

/**
 * Formats a number to always have two digits with leading zero if needed
 */
export const formatTwoDigits = (num: number): string => {
  return num.toString().padStart(2, "0")
}

/**
 * Formats countdown units for display
 */
export const formatCountdown = (time: {
  days: number
  hours: number
  minutes: number
  seconds: number
}): {
  days: string
  hours: string
  minutes: string
  seconds: string
} => {
  return {
    days: time.days.toString(),
    hours: formatTwoDigits(time.hours),
    minutes: formatTwoDigits(time.minutes),
    seconds: formatTwoDigits(time.seconds),
  }
}
