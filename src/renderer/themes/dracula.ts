import { Theme } from './_model'

const purple0 = '#21222C'
const purple1 = '#282a36'
const purple2 = '#44475a'
const purple3 = '#bd93f9'

const pink = '#ff79c6'

const green = '#50fa7b'

const concrete = '#f8f8f2'

export const dracula: Theme = {
  sample: { a: purple1, b: purple2, c: green },
  bg: purple1,
  titleBarBg: purple0,
  url: {
    text: {
      base: purple3,
      host: green,
      sponsorBase: pink,
      sponsorHost: green,
      disabled: purple2,
    },
  },
  settings: {
    text: concrete,
    border: purple2,
  },
  tiles: {
    border: purple2,
  },
  tile: {
    bg: {
      hover: purple0,
    },
    text: concrete,
  },
  button: {
    bg: purple2,
    text: {
      disabled: purple2,
      base: concrete,
      sponsor: pink,
      update: green,
    },
  },
  icons: {
    star: green,
    eye: purple3,
    keyboard: pink,
  },
}
