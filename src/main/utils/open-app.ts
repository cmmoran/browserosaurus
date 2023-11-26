import { execFile } from 'child_process'

import type { AppName } from '../../config/apps'
import { apps } from '../../config/apps'
import { formatString } from './utils'

function buildExtraArgs(
  isShift: boolean,
  isAlt: boolean,
  selectedApp: any,
): string[] {
  return [
    ...(isAlt ? ['--background'] : []),
    ...(isShift && 'privateArg' in selectedApp
      ? ['--new', '--args', selectedApp.privateArg]
      : !isShift && 'link' in selectedApp
        ? ['--new', '--args', selectedApp.profileArg]
        : []),
  ]
}

export function openApp(
  appName: AppName,
  link: AppName | undefined | null,
  url: string,
  isAlt: boolean,
  isShift: boolean,
): void {
  const selectedApp = apps[appName]
  const linkedApp = apps[link ?? appName]
  const exec = link ?? appName

  let convertedUrl = url
  if (linkedApp?.convertUrl) {
    const conv = linkedApp.convertUrl
    if (conv.search) {
      convertedUrl = convertedUrl.replace(conv.search, conv.replace)
    } else {
      convertedUrl = formatString(conv.replace, { url: convertedUrl })
    }
  }

  const extraArgs = buildExtraArgs(isShift, isAlt, selectedApp)

  const openArguments: string[] = [
    '-a',
    exec,
    extraArgs,
    // In order for private/incognito mode to work the URL needs to be passed
    // in last, _after_ the respective app.privateArg flag
    convertedUrl,
  ]
    .filter(Boolean)
    .flat()

  execFile('open', openArguments)
}
