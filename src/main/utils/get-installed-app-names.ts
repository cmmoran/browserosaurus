import { execSync } from 'node:child_process'
import path from 'node:path'

import { sleep } from 'tings'

import type { App, AppName } from '../../config/apps'
import { apps } from '../../config/apps'
import { retrievedInstalledApps, startedScanning } from '../state/actions'
import { dispatch } from '../state/store'

function getAllInstalledAppNames(): string[] {
  return execSync(
    'find ~/Applications /Applications -iname "*.app" -prune -not -path "*/.*" 2>/dev/null ||true',
  )
    .toString()
    .trim()
    .split('\n')
    .map((appPath) => path.parse(appPath).name)
}

async function getInstalledAppNames(): Promise<void> {
  dispatch(startedScanning())

  const allInstalledAppNames = getAllInstalledAppNames()

  const installedApps = Object.keys(apps as Record<string, App>).filter(
    (appName) => allInstalledAppNames.includes(appName),
  ) as AppName[]

  // It appears that sometimes the installed app IDs are not fetched, maybe a
  // race with Spotlight index? So if none found, keep retrying.
  // TODO is this needed any more, now using we're `find` method?
  // https://github.com/will-stone/browserosaurus/issues/425
  if (installedApps.length === 0) {
    await sleep(500)
    await getInstalledAppNames()
  } else {
    dispatch(retrievedInstalledApps(installedApps))
  }
}

export { getInstalledAppNames }
