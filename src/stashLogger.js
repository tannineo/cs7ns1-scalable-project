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

  sendNotification(str) {
    require('axios')({
      method: 'POST',
      url: 'https://slack.com/api/chat.postMessage',
      headers: {
        Authorization:
          'Bearer xoxb-843902607728-843905166512-FPDdw9UtvZi6sKqXgsrSxpty'
      },
      data: {
        channel: 'general',
        text: str
      }
    }).then(() => {
      this.logger('sendNotification notification sent: ' + str)
    })
  }
}
