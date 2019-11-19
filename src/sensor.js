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

    // TODO: verify the sensor type at the initialization
    this.type = consts.SENSOR_TYPE[envs.sensor.S_SENSOR_TYPE]

    // init all the modules
    const option = {
      loggerHandle: this.loggerHandle,
      type: this.type,
      name: this.name
    }
    this.power = new Power(option)
    this.comm = new Comm(option)
    this.data = new Data(option)
    this.superv = new SuperV(option)
  }

  async run() {
    this.interval = setInterval(async () => {
      this.logger('>>>>>>>> SENSOR LIFECYCLE START?????... <<<<<<<<')

      // test all the functions below
      await this.superv.getPosition()
      await this.superv.setPosition({ x: 1, y: 2 })
      await this.superv.getPower()
      await this.superv.setPower(23313)
      await this.superv.getSwitch()
      const da = this.data.genData()
      await this.superv.getAllSensorCoordinates()
      this.data.pushData(da)
      this.data.popData()

      this.logger('>>>>>>>> SENSOR LIFECYCLE END?????... <<<<<<<<')
    }, envs.sensor.S_T_INTERVAL)
  }
}
