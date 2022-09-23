import { logger } from '../utils/logger'
import EventEmitter from 'eventemitter3'
import VoiceControlGame from '..'

const TAG_NAME = 'SpeechController'

export interface SpeechControllerEventTypes {
  onSpeechResult: (res: string) => void
}

class SpeechController extends EventEmitter<SpeechControllerEventTypes> {
  recognition: SpeechRecognition

  constructor(private root: VoiceControlGame) {
    super()
    this.recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)()
    this.recognition.lang = this.root.opt.lang
    this.recognition.continuous = true

    this.recognition.onstart = this.onstart
    this.recognition.onend = this.onend
    this.recognition.onaudiostart = this.onaudiostart
    this.recognition.onaudioend = this.onaudioend
    this.recognition.onsoundstart = this.onsoundstart
    this.recognition.onsoundend = this.onsoundend
    this.recognition.onspeechstart = this.onspeechstart
    this.recognition.onspeechend = this.onspeechend
    this.recognition.onresult = this.onresult
    this.recognition.onnomatch = this.onnomatch
    this.recognition.onerror = this.onerror
  }

  start() {
    logger.log(TAG_NAME, 'start')
    this.recognition.start()
  }

  stop() {
    logger.log(TAG_NAME, 'stop')
    this.recognition.stop()
  }

  abort() {
    logger.log(TAG_NAME, 'abort')
    this.recognition.abort()
  }

  destroy() {
    logger.log(TAG_NAME, 'destroy')
    this.recognition.onstart = null
    this.recognition.onend = null
    this.recognition.onaudiostart = null
    this.recognition.onaudioend = null
    this.recognition.onsoundstart = null
    this.recognition.onsoundend = null
    this.recognition.onspeechstart = null
    this.recognition.onspeechend = null
    this.recognition.onresult = null
    this.recognition.onnomatch = null
    this.recognition.onerror = null
  }

  private onstart = (event: Event) => {
    logger.log(TAG_NAME, 'onstart', event)
  }

  private onend = (event: Event) => {
    logger.log(TAG_NAME, 'onend', event)
  }

  private onaudiostart = (event: Event) => {
    logger.log(TAG_NAME, 'onaudiostart', event)
  }

  private onaudioend = (event: Event) => {
    logger.log(TAG_NAME, 'onaudioend', event)
  }

  private onsoundstart = (event: Event) => {
    logger.log(TAG_NAME, 'onsoundstart', event)
  }

  private onsoundend = (event: Event) => {
    logger.log(TAG_NAME, 'onsoundend', event)
  }

  private onspeechstart = (event: Event) => {
    logger.log(TAG_NAME, 'onspeechstart', event)
  }

  private onspeechend = (event: Event) => {
    logger.log(TAG_NAME, 'onspeechend', event)
  }

  private onresult = (event: SpeechRecognitionEvent) => {
    logger.log(TAG_NAME, 'onresult', event)
    const len = event.results.length
    const res = event.results[len - 1][0].transcript
    this.emit('onSpeechResult', res)
  }

  private onnomatch = (event: SpeechRecognitionEvent) => {
    logger.log(TAG_NAME, 'onnomatch', event)
  }

  private onerror = (event: SpeechRecognitionErrorEvent) => {
    logger.error(TAG_NAME, 'onerror', event)
  }
}

export default SpeechController
