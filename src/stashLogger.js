import envs from './envs.js'

export default class StashLogger {
  logger
  loggerHandle

  logstashClient

  constructor(option) {
    this.loggerHandle = option.loggerHandle + ':stashLogger'
    this.logger = require('debug')(this.loggerHandle)

    const ls = require('lsudp')

    ls.init({
      appName: envs.sensor.S_SENSOR_NAME,
      host: envs.logstash.S_LOGSTASH_HOST,
      port: envs.logstash.S_LOGSTASH_PORT
    })

    this.logstashClient = ls(envs.sensor.S_SENSOR_NAME)
  }

  sendLog(logstashData) {
    this.logger('sendLog... %O', logstashData)
    this.logstashClient.debug(logstashData)
  }
}
