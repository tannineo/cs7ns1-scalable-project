import envs from './envs.js'
import consts from './consts.js'
export default class Sensor {
  /**
   * the debug logger
   */
  logger

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

  constructor() {
    // TODO: make the constructor works with options
    this.logger = require('debug')(
      envs.S_DEBUG_PREFIX + __filename + ':' + envs.sensor.S_SENSOR_NAME
    )
    this.name = envs.sensor.S_SENSOR_NAME
    this.type = consts.SENSOR_TYPE[envs.sensor.S_SENSOR_TYPE]
  }

  run() {
    this.interval = setInterval(() => {
      this.logger('the sensor producing data...')
    }, envs.sensor.S_T_INTERVAL)
  }
}
