import envs from './envs.js'
import Sensor from './sensor.js'

const logger = require('debug')(envs.S_DEBUG_PREFIX + 'index')

logger('index sersor init...')
const sensor = new Sensor()

// start the sensor
logger('index sersor starts running')
// init
sensor.init()

if (envs.sensor.S_SENSOR_TYPE === 'sink') sensor.runSink()
else sensor.run()
