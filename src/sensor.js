import envs from './envs.js'

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

  constructor() {
    this.logger = require('debug')(
      envs.S_DEBUG_PREFIX + __filename + ':' + envs.sensor.S_SENSOR_NAME
    )
    this.name = envs.sensor.S_SENSOR_NAME
  }

  run() {
    this.interval = setInterval(() => {
      this.logger('the sensor producing data...')
    }, envs.sensor.S_T_INTERVAL)
  }
}
