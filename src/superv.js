import * as dgram from 'dgram'
import * as bluebird from 'bluebird'
import * as redis from 'redis'

import envs from './envs.js'

bluebird.promisifyAll(redis)

export default class Superv {
  /**
   * the logger passed from the sensor class
   */
  logger
  loggerHandle

  redisClient

  constructor(option) {
    this.loggerHandle = option.loggerHandle + ':superv'
    this.logger = require('debug')(this.loggerHandle)

    this.logger('superv init')

    // init redis
    this.redisClient = redis.createClient({
      host: envs.redis.S_REDIS_HOST,
      port: envs.redis.S_REDIS_PORT,
      db: envs.redis.S_REDIS_DB
    })
  }

  getPosition() {}

  setPosition() {}
}
