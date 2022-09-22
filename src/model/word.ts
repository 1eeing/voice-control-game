import { rangeNum } from '../utils'

class Word {
  width: number
  height = rangeNum(14, 30)
  top = -this.height
  left: number
  score = Math.floor((1 / this.height) * 100)

  constructor(
    private canvasDom: HTMLCanvasElement,
    private ctx: CanvasRenderingContext2D,
    public content: string
  ) {
    this.left = rangeNum(0, this.canvasDom.width - this.height)
    this.width = this.ctx.measureText(this.content).width
  }
}

export default Word
