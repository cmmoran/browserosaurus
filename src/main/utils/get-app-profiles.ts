import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import ini from 'ini'

import type { App, AppName, Profile } from '../../config/apps'
import { apps } from '../../config/apps'
import {
  retrievedAppProfiles,
  startedScanningAppProfiles,
} from '../state/actions'
import { dispatch } from '../state/store'
import { formatString } from './utils'

type ProfileLocation = Record<string, Record<AppName, string>>

// Source: (chrome-ish) https://chromium.googlesource.com/chromium/src/+/HEAD/docs/user_data_dir.md
// Source: https://peter.sh/experiments/chromium-command-line-switches/
// Source: (Firefox) about:profiles
const locations: ProfileLocation = {
  ['macOS']: {
    ['Google Chrome']: `${os.homedir()}/Library/Application Support/Google/Chrome`,
    ['Google Chrome Canary']: `${os.homedir()}/Library/Application Support/Google/Chrome Canary`,
    ['Chromium']: `${os.homedir()}/Library/Application Support/Chromium`,
    ['Brave Browser']: `${os.homedir()}/Library/Application Support/BraveSoftware/Brave-Browser`,
    ['Firefox']: `${os.homedir()}/Library/Application Support/Firefox`,
  },
  ['windows']: {
    ['Google Chrome']: `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data`,
    ['Google Chrome Canary']: `${process.env.LOCALAPPDATA}\\Google\\Chrome SxS\\User Data`,
    ['Chromium']: `${process.env.LOCALAPPDATA}\\Chromium\\User Data`,
    ['Brave Browser']: `${process.env.LOCALAPPDATA}\\Brave\\User Data`,
    ['Firefox']: `${process.env.LOCALAPPDATA}\\Mozilla\\User Data`,
  },
  // TODO: consider the `~/.config` part can be overriden by $CHROME_VERSION_EXTRA or $XDG_CONFIG_HOME
  ['linux']: {
    ['Google Chrome']: `${os.homedir()}/.config/google-chrome`,
    ['Google Chrome Canary']: `${os.homedir()}/.config/google-chrome-beta`,
    ['Chromium']: `${os.homedir()}/.config/chromium`,
    ['Brave Browser']: `${os.homedir()}/.config/brave`,
    ['Firefox']: `${os.homedir()}/.mozilla/firefox`,
  },
}
const osType =
  process.platform === 'darwin'
    ? 'macOS'
    : process.platform === 'win32'
      ? 'windows'
      : 'linux'

function resolveProfiles(variant: AppName = 'Google Chrome', app: App) {
  console.log(`resolve-profiles/${variant}`)
  switch (variant) {
    case 'Google Chrome':
    case 'Google Chrome Canary':
    case 'Chromium':
    case 'Brave Browser':
      return findChromeProfiles(variant, app)
    case 'Firefox':
      return findFirefoxProfiles(variant, app)
  }
}

function findFirefoxProfiles(variant: AppName = 'Firefox', app: App) {
  console.log(`findFirefoxProfiles/${variant}`, app)
  if (fsExistsSync(path.join(locations[osType][variant], 'profiles.ini'))) {
    const profilesini = ini.parse(
      fs.readFileSync(
        path.join(locations[osType][variant], 'profiles.ini'),
        'utf8',
      ),
    )
    return Object.keys(profilesini)
      .filter((pkey) => {
        console.log(`findFirefoxProfiles/pkey=${pkey}`)
        return pkey.startsWith('Profile')
      })
      .map(
        (pi) =>
          ({
            displayName: `${variant} (${profilesini[pi]['Name']})`,
            name: profilesini[pi]['Name'],
            directory: profilesini[pi]['Path'],
            path: path.join(locations[osType][variant], profilesini[pi].Path),
          }) as Profile,
      )
      .map((p: Profile) => {
        console.log('findFirefoxProfiles/profile', p)
        return Object.assign(
          {},
          {
            [`${p.displayName}`]: {
              link: `${variant}`,
              ...('privateArg' in app ? { privateArg: app.privateArg } : {}),
              ...('profileArg' in app && app.profileArg !== undefined
                ? {
                    profileArg: formatString(app.profileArg, p),
                  }
                : {
                    profileArg: `-P "${p.name}"`,
                  }),
            },
          },
        )
      })
      .reduce((pv: any, cv: any) => Object.assign({}, pv, cv), {})
  }

  return {}
}
function findChromeProfiles(variant: AppName = 'Google Chrome', app: App) {
  return fs
    .readdirSync(locations[osType][variant])
    .filter(
      (f) =>
        f !== 'System Profile' &&
        fsExistsSync(path.join(locations[osType][variant], f, 'Preferences')),
    )
    .map((p) => {
      const buff = fs.readFileSync(
        path.join(locations[osType][variant], p, 'Preferences'),
        'utf8',
      )
      let profileInfo: any = JSON.parse(buff)
      return {
        displayName: `${variant} (${profileInfo.profile.name})`,
        name: profileInfo.profile.name,
        directory: p,
        path: path.join(locations[osType][variant], p),
      } as Profile
    })
    .map((p: Profile) =>
      Object.assign(
        {},
        {
          [`${p.displayName}`]: {
            link: `${variant}`,
            ...('privateArg' in app ? { privateArg: app.privateArg } : {}),
            ...('profileArg' in app && app.profileArg !== undefined
              ? {
                  profileArg: formatString(app.profileArg, p),
                }
              : {
                  profileArg: `--profile-directory=${p.directory}`,
                }),
          },
        },
      ),
    )
    .reduce((pv: any, cv: any) => Object.assign({}, pv, cv), {})
}
async function getAppsWithProfiles(): Promise<void> {
  dispatch(startedScanningAppProfiles())

  const appProfiles = Object.entries(apps)
    .filter(([, app]) => 'resolveProfiles' in app)
    .map(([appName, app]) =>
      'resolveProfiles' in app && app.resolveProfiles !== undefined
        ? app.resolveProfiles
          ? resolveProfiles(appName, app)
          : {}
        : {},
    )
    .reduce((pv, cv) => Object.assign({}, pv, cv), {}) as Record<AppName, App>

  Object.assign(apps, apps, appProfiles)

  dispatch(retrievedAppProfiles(appProfiles))
}

const fsExistsSync = function (file: fs.PathLike) {
  try {
    fs.accessSync(file)
    return true
  } catch (ignore) {
    return false
  }
}

export { getAppsWithProfiles }
