export default {
  /**
   * The difined sensor type
   */
  SENSOR_TYPE: {
    sink: 0,
    pace_maker: 1
  },
  REDIS_PREFIX: 'sensor_simu:',
  REDIS_KEY: {
    SWITCH: 'switch:', // based on 0/1 to off/on
    POWER: 'power:',
    COORDINATE_X: 'coor:x:',
    COORDINATE_Y: 'coor:y:'
  }
}
