import * as dgram from 'dgram'

import envs from './envs.js'
import Sensor from './sensor.js'

const log = require('debug')(envs.S_DEBUG_PREFIX + __filename)

const sensor = new Sensor()

// start the sensor
sensor.run()
