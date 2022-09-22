import VoiceControlGame from '..'
import Word from '../model/word'
import { rangeArrItem } from '../utils'
import enUS from '../dicts/en-US'
import zhCN from '../dicts/zh-CN'
import { logger } from '../utils/logger'

const TAG_NAME = 'GameController'

// TODO 交互优化
class GameController {
  canvasDom: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  drawTimer?: number
  downRate = 1000
  downTimer?: number
  downHeight = 0.1
  genWordRate = 1000
  genWordTimer?: number
  countdown = 20
  countdownTimer?: number

  score = 0

  words: Word[] = []

  constructor(private root: VoiceControlGame) {
    if (!this.root.opt.canvasDom.getContext('2d')) {
      throw Error('Your broswer is not support Canvas.')
    }
    this.canvasDom = this.root.opt.canvasDom
    this.ctx = this.canvasDom.getContext('2d')!

    this.root.emitter.on('onSpeechResult', this.onSpeechResult)
  }

  start() {
    this.startDraw()
  }

  stop() {
    logger.log(TAG_NAME, 'stop', 'score: ', this.score)
    this.stopDraw()
  }

  pause() {
    this.stopDraw()
  }

  replay() {
    /** */
  }

  private startDraw() {
    this.drawCanvas()
    this.downTimer = window.setInterval(this.down.bind(this), this.downTimer)
    this.genWordTimer = window.setInterval(
      this.genWord.bind(this),
      this.genWordRate
    )
    this.countdownTimer = window.setInterval(
      this.countdownHandler.bind(this),
      1000
    )
  }

  private stopDraw() {
    if (this.drawTimer) {
      window.cancelAnimationFrame(this.drawTimer)
      this.drawTimer = undefined
    }
    if (this.downTimer) {
      window.clearInterval(this.downTimer)
      this.downTimer = undefined
    }
    if (this.genWordTimer) {
      window.clearInterval(this.genWordTimer)
      this.genWordTimer = undefined
    }
    if (this.countdownTimer) {
      window.clearInterval(this.countdownTimer)
      this.countdownTimer = undefined
    }
  }

  private resetState() {
    /** */
  }

  private drawCanvas() {
    this.ctx.clearRect(0, 0, this.canvasDom.width, this.canvasDom.height)
    this.words.forEach((item) => {
      this.ctx.font = item.height + 'px'
      this.ctx.fillText(item.content, item.left, item.top)
    })

    if (this.countdown <= 0) {
      this.stop()
      return
    }

    this.drawTimer = window.requestAnimationFrame(this.drawCanvas.bind(this))
  }

  private down() {
    for (let i = 0; i < this.words.length; i++) {
      const item = this.words[i]
      if (item.top < this.canvasDom.height) {
        item.top += this.downHeight
      } else {
        this.words.splice(i, 1)
        i--
      }
    }
  }

  private genWord() {
    const word = new Word(
      this.canvasDom,
      this.ctx,
      rangeArrItem(this.root.opt.lang === 'zh-CN' ? zhCN : enUS)
    )
    this.words.push(word)
  }

  private onSpeechResult = (text: string) => {
    logger.log(TAG_NAME, 'onSpeechResult', text)
    for (let i = 0; i < this.words.length; i++) {
      const item = this.words[i]
      if (item.content === text) {
        this.score += item.score
        this.words.splice(i, 1)
        i--
      }
    }
  }

  private countdownHandler() {
    this.countdown--
  }
}

export default GameController
