export const rangeNum = (from: number, to: number): number => {
  return Math.floor(Math.random() * (to - from + 1)) + from
}

export const rangeArrItem = <T>(arr: T[]): T => {
  const index = rangeNum(0, arr.length - 1)
  return arr[index]
}
