import envs from './envs.js'

export default class Data {
  logger
  loggerHandle

  dataType

  constructor(option) {
    this.loggerHandle = option.loggerHandle
    this.logger = require('debug')(this.loggerHandle + ':data')

    this.logger('data module init with option: %O', option)

    this.dataType = option.type
  }
}
