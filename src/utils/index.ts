export const rangeNum = (from: number, to: number): number => {
  return Math.floor(Math.random() * (to - from + 1)) + from
}

export const rangeArrItem = <T>(arr: T[]): T => {
  const index = rangeNum(0, arr.length - 1)
  return arr[index]
}

export const rangeRgb = (): string => {
  //rgb颜色随机
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  const rgb = 'rgb(' + r + ',' + g + ',' + b + ')'
  return rgb
}
