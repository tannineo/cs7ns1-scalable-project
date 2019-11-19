import * as dgram from 'dgram'
import envs from './envs.js'

export default class Comm {
  logger
  loggerHandle

  /**
   * the client to
   */
  client2Sensor
  server

  constructor(option) {
    this.loggerHandle = option.loggerHandle
    this.logger = require('debug')(this.loggerHandle + ':comm')
    this.logger('init udp socket using %o', envs.udp.S_UDP_TYPE)

    this.client2Sensor = dgram.createSocket(envs.udp.S_UDP_TYPE)
    this.server = dgram.createSocket(envs.udp.S_UDP_TYPE)

    // start binding
    this.server.bind(
      {
        address: envs.udp.S_SERVER_HOST,
        port: envs.udp.SERVER_PORT
      },
      () => {
        this.logger('sensor listening on %O', {
          host: envs.udp.S_SERVER_HOST,
          port: envs.udp.S_SERVER_PORT
        })
      }
    )
  }
}
