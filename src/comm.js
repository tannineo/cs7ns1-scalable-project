import * as dgram from 'dgram'

import Coordinate from './coordinate'
import envs from './envs.js'

export default class Comm {
  logger
  loggerHandle

  coor

  /**
   * the server listening to the request
   */
  server

  constructor(option) {
    this.loggerHandle = option.loggerHandle
    this.logger = require('debug')(this.loggerHandle + ':comm')
    this.logger('init udp socket using %o', envs.udp.S_UDP_TYPE)

    this.coor = new Coordinate({
      x: envs.sensor.S_POS_X,
      y: envs.sensor.S_POS_Y
    })

    this.server = dgram.createSocket(envs.udp.S_UDP_TYPE)

    // start binding
    this.server.bind(envs.udp.S_SERVER_PORT)

    // listening event
    this.server.on('listening', () => {
      this.logger('sensor listening on %O', {
        port: envs.udp.S_SERVER_PORT
      })
    })

    // register event
    this.server.on('message', (buf, rinfo) => {
      let data = {}
      try {
        data = JSON.parse(buf.toString('utf8'))
      } catch {
        data = {}
      }

      this.logger('server received message: %O', {
        data,
        rinfo
      })
    })
  }

  sendData2Node(data, host, port) {
    this.logger('sendData2Node sending data: %O', {
      data,
      host,
      port
    })
    const client = dgram.createSocket(envs.udp.S_UDP_TYPE)
    const buf = Buffer.from(JSON.stringify(data), 'utf8')
    client.send(buf, port, host, err => {
      this.logger('client.send result err:%O', err)
      client.close()
    })
  }
}
