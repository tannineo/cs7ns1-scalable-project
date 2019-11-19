import * as dgram from 'dgram'
import * as _ from 'lodash'
import * as bluebird from 'bluebird'
import * as redis from 'redis'

import Coordinate from './coordinate.js'

import envs from './envs.js'

bluebird.promisifyAll(redis)

// values below are editable during runtime
const REDIS_PREFIX_POS = 'sensor:pos:'
const REDIS_PREFIX_POW = 'sensor:pow:'
const REDIS_PREFIX_SWITCH = 'sensor:switch:'

/**
 *
 * since the data here won't change otfen (except power)
 * we don't have to worry about the atomic issue
 *
 */
export default class Superv {
  /**
   * the logger passed from the sensor class
   */

  /**
   * the sensor name
   */
  name

  logger
  loggerHandle

  redisClient

  constructor(option) {
    this.loggerHandle = option.loggerHandle + ':superv'
    this.logger = require('debug')(this.loggerHandle)

    this.logger('superv init with option: %O', option)

    this.name = option.name

    // init redis
    this.redisClient = redis.createClient({
      host: envs.redis.S_REDIS_HOST,
      port: envs.redis.S_REDIS_PORT,
      db: envs.redis.S_REDIS_DB
    })
  }

  /**
   * get the coordinate from redis
   */
  async getPosition(key = null) {
    if (_.isNull(key)) key = REDIS_PREFIX_POS + this.name
    let coorJSON = await this.redisClient.getAsync(key)
    coorJSON = JSON.parse(coorJSON)
    let x, y
    if (_.isNull(coorJSON)) {
      x = -1
      y = -1
    } else {
      x = parseFloat(coorJSON.x)
      y = parseFloat(coorJSON.y)
    }

    const coor = new Coordinate(x, y)

    this.logger('getPosition return new Coordinate: %O', coor)

    return coor
  }

  /**
   * set the coordinate into redis
   *
   * @param {Coordinate} coor
   */
  async setPosition(coor) {
    this.logger('setPosition set new Coordinate: %O', coor)

    const { x, y } = coor

    await this.redisClient.setAsync(
      REDIS_PREFIX_POS + this.name,
      JSON.stringify({ x, y })
    )
  }

  async getPower() {
    let pow = await this.redisClient.getAsync(REDIS_PREFIX_POW + this.name)
    pow = parseInt(pow)

    this.logger('getPower return new pow: %O', pow)

    return pow
  }

  /**
   * set the coordinate into redis
   *
   * @param {Coordinate} coor
   */
  async setPower(pow) {
    this.logger('setPower set new pow: %O', pow)

    await this.redisClient.setAsync(REDIS_PREFIX_POW + this.name, pow)
  }

  async getSwitch() {
    const onOff = await this.redisClient.getAsync(
      REDIS_PREFIX_SWITCH + this.name
    )

    this.logger('getSwitch return the swtich status: %O', onOff)

    if (onOff === '1') return true

    return false
  }

  async getAllSensorCoordinates() {
    let result = await this.redisClient.scanAsync(
      envs.redis.S_REDIS_DB,
      'MATCH',
      REDIS_PREFIX_POS + '*'
    )
    result = result[1] // rid of 'envs.redis.S_REDIS_DB' at index 0
    result = await bluebird.all(result.map(r => this.getPosition(r)))

    this.logger('getAllSensorCoordinates list: %O', result)
  }
}
