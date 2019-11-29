const S_DEBUG_PREFIX = 'sensor:'

const log = require('debug')(S_DEBUG_PREFIX + 'envs')

// udp settings
const S_SERVER_NAME = process.env.S_SERVER_NAME || 'sensor' + Date.now()
const S_SERVER_HOST = process.env.S_SERVER_HOST || '0.0.0.0'
const S_SERVER_PORT = parseInt(process.env.S_SERVER_PORT || 6666)
const S_UDP_TYPE = process.env.S_UDP_TYPE || 'udp4'

// redis settings
const S_REDIS_HOST = process.env.S_REDIS_HOST || 'localhost'
const S_REDIS_PORT = process.env.S_REDIS_PORT || '6379'
const S_REDIS_DB = process.env.S_REDIS_DB || '0'

// sensor settings
const S_SENSOR_NAME = process.env.S_SENSOR_NAME || 'sensor233'
const S_SENSOR_TYPE = process.env.S_SENSOR_TYPE || 'bodyTemp' // the sink is special
const S_T_INTERVAL = 3000 // ms
const S_MAX_RANGE = parseInt(process.env.S_MAX_RANGE || 5) // cm
const S_MAX_POWER = parseInt(process.env.S_MAX_POWER || 100)
const S_POS_X = parseInt(process.env.S_POS_X || 1)
const S_POS_Y = parseInt(process.env.S_POS_Y || 1)
const S_HEARTBEAT_TIMEOUT = parseInt(
  process.env.S_HEARTBEAT_TIMEOUT || 30 * 1000 // ms
)

// the power used
const S_POWER_USE_T = parseInt(process.env.S_POWER_USE_T || 1)
const S_POWER_USE_N = parseInt(process.env.S_POWER_USE_N || 1)

// sink settings
const S_SINK_HOST = process.env.S_SINK_HOST || 'localhost'
const S_SINK_PORT = parseInt(process.env.S_SINK_PORT || 6660)

// the logstash settings
const S_LOGSTASH_HOST = process.env.S_LOGSTASH_HOST || 'localhost'
const S_LOGSTASH_PORT = parseInt(process.env.S_LOGSTASH_PORT || 7777)

const settings = {
  udp: {
    S_SERVER_HOST,
    S_SERVER_PORT,
    S_SERVER_NAME,
    S_UDP_TYPE
  },
  redis: {
    S_REDIS_HOST,
    S_REDIS_PORT,
    S_REDIS_DB
  },
  sensor: {
    S_SENSOR_NAME,
    S_SENSOR_TYPE,
    S_T_INTERVAL,
    S_MAX_RANGE,
    S_MAX_POWER,
    S_POWER_USE_T,
    S_POWER_USE_N,
    S_POS_X,
    S_POS_Y,
    S_HEARTBEAT_TIMEOUT,
    S_SINK_HOST,
    S_SINK_PORT
  },
  logstash: {
    S_LOGSTASH_HOST,
    S_LOGSTASH_PORT
  },
  S_DEBUG_PREFIX
}

log('sensor initializing with settings: %O', settings)

export default settings
