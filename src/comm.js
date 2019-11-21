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
  }

  sendData2Node(data, host, port, event = 'data') {
    this.logger('sendData2Node sending data: %O', {
      event,
      data,
      host,
      port
    })

    data.event = event

    const client = dgram.createSocket(envs.udp.S_UDP_TYPE)
    const buf = Buffer.from(JSON.stringify(data), 'utf8')
    client.send(buf, port, host, err => {
      this.logger('client.send result err:%O', err)
      client.close()
    })
  }
}
