import { execFile } from "child_process";

import type { AppName } from "../../config/apps";
import { apps } from "../../config/apps";

function buildExtraArgs(
  isShift: boolean,
  isAlt: boolean,
  selectedApp: any
): string[] {
  return [
    ...(isAlt ? ["--background"] : []),
    ...(isShift && ("privateArg" in selectedApp)
      ? ["--new", "--args", selectedApp.privateArg]
      : (!isShift && ("link" in selectedApp)
        ? ["--new", "--args", selectedApp.profileArg]
        : []
      ))
  ];
}

export function openApp(
  appName: AppName,
  link: AppName | undefined | null,
  url: string,
  isAlt: boolean,
  isShift: boolean
): void {
  const selectedApp = apps[appName];
  const exec = link ?? appName;

  const convertedUrl =
    "convertUrl" in selectedApp ? selectedApp.convertUrl(url) : url;

  const extraArgs = buildExtraArgs(isShift, isAlt, selectedApp);

  const openArguments: string[] = [
    "-a",
    exec,
    extraArgs,
    // In order for private/incognito mode to work the URL needs to be passed
    // in last, _after_ the respective app.privateArg flag
    convertedUrl
  ]
    .filter(Boolean)
    .flat();

  execFile("open", openArguments);
}
