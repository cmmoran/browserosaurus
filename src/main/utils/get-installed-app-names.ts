import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { sleep } from "tings";

import type { App, AppName, Profile } from "../../config/apps";
import { apps } from "../../config/apps";
import { retrievedInstalledApps, startedScanning } from "../state/actions";
import { dispatch } from "../state/store";

function getAllInstalledAppNames(): string[] {
  return execSync(
    "find ~/Applications /Applications -iname \"*.app\" -prune -not -path \"*/.*\" 2>/dev/null ||true"
  )
    .toString()
    .trim()
    .split("\n")
    .map((appPath) => path.parse(appPath).name);
}

function profiles(variant = variations.CHROME) {
  return fs.readdirSync(locations[osType][variant])
    .filter(f => f !== "System Profile" && fsExistsSync(path.join(locations[osType][variant], f, "Preferences")))
    .map(p => {
      const buff = fs.readFileSync(path.join(locations[osType][variant], p, "Preferences"), "utf8");
      let profileInfo: any = JSON.parse(buff);
      return {
        displayName: profileInfo.profile.name,
        profileDirName: p,
        profileDirPath: path.join(locations[osType][variant], p),
        profilePictureUrl: profileInfo.profile.gaia_info_picture_url || undefined
      } as Profile;
    });
}
function getAppsWithProfiles(): Record<string, App> {
  return Object.entries(apps)
    .filter(([, app]) => "resolveProfiles" in app)
    .map(([appName, app]) => ("resolveProfiles" in app && app.resolveProfiles !== undefined)
      ? app.resolveProfiles
        ? profiles()
          .filter((p: Profile) => p.profileDirName !== "Guest Profile")
          .map((p: Profile) => Object.assign({}, ({
            [`${p.displayName}`]: {
              link: `${appName}`,
              ...("privateArg" in app ? { privateArg: app.privateArg } : {}),
              ...("profileArg" in app ? { profileArg: app.profileArg } : { profileArg: `--profile-directory=${p.profileDirName}` })
            }
          })))
          .reduce((pv: any, cv: any) => Object.assign({}, pv, cv), {})
        : {}
      : {})
    .reduce((pv, cv) => Object.assign({}, pv, cv), {}) as Record<AppName, App>;
}

async function getInstalledAppNames(): Promise<void> {
  dispatch(startedScanning());

  const allInstalledAppNames = getAllInstalledAppNames();

  Object.assign(apps, apps, getAppsWithProfiles());

  const installedApps = Object.keys(apps as Record<string, App>)
    .filter((appName) => {
      const link = ("link" in apps[appName as AppName]) ? (apps[appName as AppName] as any).link : undefined;
      return allInstalledAppNames.includes(link ?? appName);
    }) as AppName[];

  // It appears that sometimes the installed app IDs are not fetched, maybe a
  // race with Spotlight index? So if none found, keep retrying.
  // TODO is this needed any more, now using we're `find` method?
  // https://github.com/will-stone/browserosaurus/issues/425
  if (installedApps.length === 0) {
    await sleep(500);
    await getInstalledAppNames();
  } else {
    dispatch(retrievedInstalledApps(installedApps));
  }
}

const fsExistsSync = function(file: fs.PathLike) {
  try {
    fs.accessSync(file);
    return true;
  } catch (ignore) {
    return false;
  }
};

const osType = process.platform === "darwin" ? "macOS" : process.platform === "win32" ? "windows" : "linux";
const variations = {
  CHROME: 0,
  CHROME_CANARY: 1,
  CHROMIUM: 2
};
// Source: https://chromium.googlesource.com/chromium/src/+/HEAD/docs/user_data_dir.md
const locations = {
  macOS: [
    `${os.homedir()}/Library/Application Support/Google/Chrome`,
    `${os.homedir()}/Library/Application Support/Google/Chrome Canary`,
    `${os.homedir()}/Library/Application Support/Chromium`
  ],
  windows: [
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\User Data`,
    `${process.env.LOCALAPPDATA}\\Google\\Chrome SxS\\User Data`,
    `${process.env.LOCALAPPDATA}\\Chromium\\User Data`
  ],
  // TODO: consider the `~/.config` part can be overriden by $CHROME_VERSION_EXTRA or $XDG_CONFIG_HOME
  linux: [
    `${os.homedir()}/.config/google-chrome`,
    `${os.homedir()}/.config/google-chrome-beta`,
    `${os.homedir()}/.config/chromium`
  ]
};


export { getInstalledAppNames, profiles };
