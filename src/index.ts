import EventEmitter from 'eventemitter3'
import SpeechController from './controllers/speechController'
import GameController, {
  GameControllerEventTypes,
} from './controllers/gameController'

export interface VoiceControlGameOpt {
  canvasDom: HTMLCanvasElement
  lang: 'zh-CN' | 'en-US'
}

class VoiceControlGame extends EventEmitter<GameControllerEventTypes> {
  gameController: GameController
  speechController: SpeechController

  constructor(public opt: VoiceControlGameOpt) {
    super()
    this.speechController = new SpeechController(this)
    this.gameController = new GameController(this)

    this.gameController.on('gameStart', this.onGameStart)
    this.gameController.on('gameEnd', this.onGameEnd)
    this.gameController.on('gameContinue', this.onGameContinue)
    this.gameController.on('gamePause', this.onGamePause)
    this.gameController.on('gameReplay', this.onGameReplay)
    this.gameController.on('updateScore', this.onUpdateScore)
    this.gameController.on('updateCountdown', this.onUpdateCountdown)
  }

  start() {
    this.gameController.start()
  }

  stop() {
    this.gameController.stop()
  }

  continue() {
    this.gameController.continue()
  }

  pause() {
    this.gameController.pause()
  }

  replay() {
    this.gameController.replay()
  }

  destroy() {
    this.gameController.destroy()
    this.speechController.destroy()

    this.gameController.off('gameStart', this.onGameStart)
    this.gameController.off('gameEnd', this.onGameEnd)
    this.gameController.off('gameContinue', this.onGameContinue)
    this.gameController.off('gamePause', this.onGamePause)
    this.gameController.off('updateScore', this.onUpdateScore)
    this.gameController.off('updateCountdown', this.onUpdateCountdown)
  }

  private onGameStart = () => {
    this.speechController.start()
    this.emit('gameStart')
  }

  private onGameEnd = () => {
    this.speechController.stop()
    this.emit('gameEnd')
  }

  private onGameContinue = () => {
    this.speechController.start()
    this.emit('gameContinue')
  }

  private onGamePause = () => {
    this.speechController.stop()
    this.emit('gamePause')
  }

  private onGameReplay = () => {
    this.speechController.start()
    this.emit('gameReplay')
  }

  private onUpdateScore = (score: number) => {
    this.emit('updateScore', score)
  }

  private onUpdateCountdown = (countdown: number) => {
    this.emit('updateCountdown', countdown)
  }
}

export default VoiceControlGame
