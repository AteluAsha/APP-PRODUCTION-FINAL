const FULLY_VISIBLE_STYLE = { opacity: 1 }

/**
 * Home dashboards must paint at full opacity. The 7-ball course is never
 * hidden behind a fade or a loading gate.
 */
export function useHomeSomaticEntrance(_dashboardReady: boolean) {
  return {
    contentOpacityStyle: FULLY_VISIBLE_STYLE,
  }
}
