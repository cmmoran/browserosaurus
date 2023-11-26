type App = {
  link?: string
  privateArg?: string
  profileArg?: string
  resolveProfiles?: boolean
  convertUrl?: {
    search?: string | RegExp
    replace: string
  }
}

type Profile = {
  displayName: string
  name: string
  directory: string
  path: string
}
const typeApps = <T extends Record<string, App>>(apps: T) => apps

const apps: Record<string, App> = typeApps({
  'Arc': {},
  'Blisk': {},
  'Brave Browser': {
    privateArg: '--incognito',
    profileArg: '--profile-directory={directory}',
    resolveProfiles: true,
  },
  'Brave Browser Beta': {
    privateArg: '--incognito',
    profileArg: '--profile-directory={directory}',
    resolveProfiles: true,
  },
  'Brave Browser Nightly': {
    privateArg: '--incognito',
    profileArg: '--profile-directory={directory}',
    resolveProfiles: true,
  },
  'Brave Dev': {
    privateArg: '--incognito',
  },
  'Chromium': {
    privateArg: '--incognito',
  },
  'Discord': {
    convertUrl: {
      search: /^https?:\/\/(?:(?:ptb|canary)\.)?discord\.com\//u,
      replace: 'discord://-/',
    },
  },
  'Discord Canary': {
    convertUrl: {
      search: /^https?:\/\/(?:(?:ptb|canary)\.)?discord\.com\//u,
      replace: 'discord://-/',
    },
  },
  'Discord PTB': {
    convertUrl: {
      search: /^https?:\/\/(?:(?:ptb|canary)\.)?discord\.com\//u,
      replace: 'discord://-/',
    },
  },
  'Dissenter': {},
  'DuckDuckGo': {},
  'Epic': {},
  'Figma': {},
  'Figma Beta': {},
  'Finicky': {},
  'Firefox': {
    privateArg: '--private-window',
    profileArg: '-P "{name}"',
    resolveProfiles: true,
  },
  'Firefox Developer Edition': {
    privateArg: '--private-window',
  },
  'Firefox Nightly': {
    privateArg: '--private-window',
  },
  'Framer': {},
  'FreeTube': {},
  'Google Chrome': {
    privateArg: '--incognito',
    profileArg: '--profile-directory={directory}',
    resolveProfiles: true,
  },
  'Google Chrome Beta': {
    privateArg: '--incognito',
  },
  'Google Chrome Canary': {
    privateArg: '--incognito',
  },
  'Google Chrome Dev': {
    privateArg: '--incognito',
  },
  'IceCat': {
    privateArg: '--private-window',
  },
  'Iridium': {},
  'Island': {},
  'Lagrange': {},
  'LibreWolf': {
    privateArg: '--private-window',
  },
  'Linear': {},
  'Maxthon': {},
  'Microsoft Edge': {},
  'Microsoft Edge Beta': {},
  'Microsoft Edge Canary': {},
  'Microsoft Edge Dev': {},
  'Microsoft Teams': {
    convertUrl: {
      search: 'https://teams.microsoft.com/',
      replace: 'msteams:/',
    },
  },
  'Min': {},
  'Miro': {},
  'Mullvad Browser': {
    privateArg: '--private-window',
  },
  'NAVER Whale': {},
  'Notion': {},
  'Opera': {},
  'Opera Beta': {},
  'Opera CD': {},
  'Opera Crypto': {},
  'Opera Dev': {},
  'Opera Developer': {},
  'Opera GX': {},
  'Opera Neon': {},
  'Orion': {},
  'Orion RC': {},
  'Pocket': {
    convertUrl: {
      replace: 'pocket://add?url={url}',
    },
  },
  'Polypane': {},
  'qutebrowser': {},
  'Safari': {},
  'Safari Technology Preview': {},
  'Sidekick': {
    privateArg: '--incognito',
  },
  'SigmaOS': {},
  'Sizzy': {},
  'Slack': {},
  'Spotify': {},
  'Thorium': {},
  'Tor Browser': {},
  'Twitter': {},
  'Ulaa': {
    privateArg: '--incognito',
  },
  'Vivaldi': {},
  'Vivaldi Snapshot': {},
  'Waterfox': {},
  'Wavebox': {
    privateArg: '--incognito',
  },
  'Whist': {},
  'Yandex': {},
  'Yattee': {},
  'zoom.us': {},
})

type Apps = typeof apps

type AppName = keyof typeof apps

export { AppName, App, Apps, Profile, apps }
