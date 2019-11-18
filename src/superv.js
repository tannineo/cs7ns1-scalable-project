import * as dgram from 'dgram'
import * as redis from 'redis'

import envs from './envs.js'

const log = require('debug')(envs.S_DEBUG_PREFIX + __filename)

const client2Logstash = dgram.createSocket(envs.udp.S_UDP_TYPE)
