import EventEmitter from 'eventemitter3'
import SpeechController from './controllers/speechController'
import GameController from './controllers/gameController'

export interface VoiceControlGameOpt {
  canvasDom: HTMLCanvasElement
  lang: 'zh-CN' | 'en-US'
}

export interface EventTypes {
  onSpeechResult: (res: string) => void
}

class VoiceControlGame {
  gameController: GameController
  speechController: SpeechController
  emitter: EventEmitter<EventTypes>

  constructor(public opt: VoiceControlGameOpt) {
    this.emitter = new EventEmitter()
    this.gameController = new GameController(this)
    this.speechController = new SpeechController(this)
  }

  start() {
    this.gameController.start()
    this.speechController.start()
  }

  stop() {
    this.gameController.stop()
    this.speechController.stop()
  }
}

export default VoiceControlGame
