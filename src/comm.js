import * as dgram from 'dgram'
import envs from './envs.js'

const log = require('debug')(envs.S_DEBUG_PREFIX + __filename)

log('init udp socket using %o', envs.S_UDP_TYPE)

// create client
const client2Sensor = dgram.createSocket(envs.udp.S_UDP_TYPE)

// create server
const server = dgram.createSocket(envs.udp.S_UDP_TYPE)

// start binding
server.bind(
  {
    address: envs.udp.S_SERVER_HOST,
    port: envs.udp.SERVER_PORT
  },
  () => {
    log('sensor listening on %O', {
      host: envs.udp.S_SERVER_HOST,
      port: envs.udp.S_SERVER_PORT
    })
  }
)

export default {
  server,
  client2Sensor
}
