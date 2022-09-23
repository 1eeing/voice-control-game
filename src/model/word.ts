import { rangeNum, rangeRgb } from '../utils'

class Word {
  width: number
  height = rangeNum(14, 30)
  top = 0
  left: number
  font = this.height + 'px serif'
  fillStyle = rangeRgb()
  score = Math.floor((1 / this.height) * 100)

  constructor(
    private canvasDom: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    public content: string
  ) {
    this.width = this.ctx.measureText(this.content).width
    this.left = rangeNum(0, this.canvasDom.width - this.width)
  }
}

export default Word
