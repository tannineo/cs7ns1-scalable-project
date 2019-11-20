import envs from './envs.js'
import Sensor from './sensor.js'

const logger = require('debug')(envs.S_DEBUG_PREFIX + 'index')

logger('index sersor init...')
const sensor = new Sensor()

// start the sensor
logger('index sersor starts running')
sensor.init()
sensor.run()
