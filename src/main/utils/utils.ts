const formatString = function (str?: string, ...args: any): string {
  if (str === undefined) {
    return ''
  }
  if (args !== undefined && args.length === 1 && typeof args[0] === 'object') {
    const replacer = args[0]
    Object.keys(replacer).forEach((k) => {
      str = str?.replace(new RegExp(`{(${k})}`, 'g'), function (match: string) {
        return replacer[k] ?? match
      })
    })
  } else {
    return str.replace(/{(\d+)}/g, function (match: string, number: number) {
      return typeof args[number] != 'undefined' ? args[number] : match
    })
  }
  return str
}

export { formatString }
