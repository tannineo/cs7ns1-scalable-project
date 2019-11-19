import envs from './envs.js'

export default class Power {
  logger
  loggerHandle

  max

  value

  costOfTransition

  costOfNormalRoutine

  constructor(option) {
    // TODO: make constructor work with options
    this.loggerHandle = option.loggerHandle + ':power'
    this.logger = require('debug')(this.loggerHandle)
    // init the properties
    this.max = envs.sensor.S_MAX_POWER
    this.value = this.max
    this.costOfTransition = envs.sensor.S_POWER_USE_T
    this.costOfNormalRoutine = envs.sensor.S_POWER_USE_N

    this.logger('init power module using %O', {
      max: this.max,
      costOfTransition: this.costOfTransition,
      costOfNormalRoutine: this.costOfNormalRoutine
    })
  }

  doTransition() {
    // minus cost
    this.value -= this.costOfTransition
    // check if it reaches a threshold
  }

  doRoutine() {
    // minus cost
    this.value -= this.costOfNormalRoutine
    // check if it reaches a threshold
  }
}
