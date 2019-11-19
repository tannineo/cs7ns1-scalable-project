import envs from './envs.js'
import consts from './consts.js'

import Data from './Data.js'
import Power from './Power.js'
import Comm from './Comm.js'
import SuperV from './superv.js'

export default class Sensor {
  /**
   * the debug logger
   */
  logger

  /**
   * loggerHandle used by logger
   */
  loggerHandle

  /**
   * the interval timer defined by a
   */
  interval

  /**
   * name of the sensor
   */
  name

  /**
   * the type of sensor
   */
  type

  /**
   * the object managing comm includs:
   *   a server listening on a udp port
   *   a client to send  udp data
   */
  comm

  /**
   * data includes:
   *   a callback to produce the data according to the
   */
  data

  /**
   * the object to manage power
   */
  power

  /**
   * the simulator part but not the sensor part
   */
  superv

  constructor() {
    // TODO: make the constructor works with options
    this.loggerHandle =
      envs.S_DEBUG_PREFIX + 'sensor.js:' + envs.sensor.S_SENSOR_NAME
    this.logger = require('debug')(this.loggerHandle)
    this.name = envs.sensor.S_SENSOR_NAME
    this.type = consts.SENSOR_TYPE[envs.sensor.S_SENSOR_TYPE]

    // init all the modules
    const option = {
      loggerHandle: this.loggerHandle
    }
    this.power = new Power(option)
    this.comm = new Comm(option)
    this.data = new Data({ type: this.type, ...option })
    this.superv = new SuperV(option)
  }

  run() {
    this.interval = setInterval(() => {
      this.logger('the sensor producing data...')
    }, envs.sensor.S_T_INTERVAL)
  }
}
