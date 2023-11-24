import deepEqual from 'fast-deep-equal'
import type { TypedUseSelectorHook } from 'react-redux'
import { shallowEqual, useSelector as useReduxSelector } from 'react-redux'

import type { AppName } from '../../../config/apps'
import type { RootState } from '../../../shared/state/reducer.root'

const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector

const useShallowEqualSelector: TypedUseSelectorHook<RootState> = (selector) =>
  useSelector(selector, shallowEqual)

const useDeepEqualSelector: TypedUseSelectorHook<RootState> = (selector) =>
  useSelector(selector, deepEqual)

type InstalledApp = {
  name: AppName
  link?: AppName
  hotCode: string | null
}

const useInstalledApps = (): InstalledApp[] => {
  const storedApps = useDeepEqualSelector((state) => state.storage.apps)
  return storedApps
    .filter((storedApp) => storedApp.isInstalled)
    .map((storedApp) => ({
      hotCode: storedApp.hotCode,
      name: storedApp.name,
      link: storedApp.link
    }))
}

const useKeyCodeMap = (): Record<string, string> =>
  useShallowEqualSelector((state) => state.data.keyCodeMap)

export {
  InstalledApp,
  useDeepEqualSelector,
  useInstalledApps,
  useKeyCodeMap,
  useSelector,
  useShallowEqualSelector,
}
