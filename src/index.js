import * as dgram from 'dgram'

const log = require('debug')('sensor:' + __filename)

const SERVER_HOST = '0.0.0.0'
const SERVER_PORT = 6666

// create client
const client2Sensor = dgram.createSocket('udp4')
const client2Logstash = dgram.createSocket('udp4')

// create server
const server = dgram.createSocket('udp4')

server.on('listening', () => {
  log('sensor listening on %O', {
    SERVER_HOST,
    SERVER_PORT
  })
})

// start binding
server.bind({
  address: SERVER_HOST,
  port: SERVER_PORT
})
