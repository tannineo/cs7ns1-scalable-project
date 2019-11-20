import * as bluebird from 'bluebird'

import envs from './envs.js'
import consts from './consts.js'

import Data from './Data.js'
import Power from './Power.js'
import Comm from './Comm.js'
import SuperV from './superv.js'
import StashLogger from './stashLogger.js'

export default class Sensor {
  /**
   * the debug logger
   */
  logger

  /**
   * loggerHandle used by logger
   */
  loggerHandle

  /**
   * the interval timer defined by a
   */
  interval

  /**
   * name of the sensor
   */
  name

  /**
   * the type of sensor
   */
  type

  /**
   * the object managing comm includs:
   *   a server listening on a udp port
   *   a client to send  udp data
   */
  comm

  /**
   * data includes:
   *   a callback to produce the data according to the
   */
  data

  /**
   * the object to manage power
   */
  power

  /**
   * the simulator part but not the sensor part
   */
  superv

  /**
   * the logger to send metrics to Logstash
   */
  stashLogger

  constructor() {
    // TODO: make the constructor works with options
    this.loggerHandle =
      envs.S_DEBUG_PREFIX + 'sensor.js:' + envs.sensor.S_SENSOR_NAME
    this.logger = require('debug')(this.loggerHandle)
    this.name = envs.sensor.S_SENSOR_NAME

    // TODO: verify the sensor type at the initialization
    this.type = consts.SENSOR_TYPE[envs.sensor.S_SENSOR_TYPE]

    // init all the modules
    const option = {
      loggerHandle: this.loggerHandle,
      type: this.type,
      name: this.name
    }
    this.power = new Power(option)
    this.comm = new Comm(option)
    this.data = new Data(option)
    this.superv = new SuperV(option)
    this.stashLogger = new StashLogger(option)
  }

  async init() {
    this.logger('>>>>>>>> SENSOR LIFECYCLE INITIALIZING... <<<<<<<<')
    // initialize
    await bluebird.all([
      this.superv.setPosition({
        x: envs.sensor.S_POS_X,
        y: envs.sensor.S_POS_Y
      }),
      this.superv.setPower(envs.sensor.S_MAX_POWER)
    ])
  }

  async run() {
    this.interval = setInterval(async () => {
      // check if the sensor is off
      if (this.superv.getSwitch()) {
        this.logger('>>>>>>>> SENSOR LIFECYCLE START?????... <<<<<<<<')

        // 1. update sensor settings
        this.power.value = await this.superv.getPower()
        this.comm.coor = await this.superv.getPosition()

        const originalPower = this.power.value

        // 2. producing sensor data
        const gd = this.data.genData()
        this.data.pushData(gd)

        // 3. routine power consumption
        this.power.doRoutine()

        // 4. pop data from data store
        const dataPack = []
        for (let i = 0; i < 5; i++) {
          const d = this.data.popData()
          if (d) {
            dataPack.push(d)
          }
        }

        // 5. calculate the nearest route
        // TODO

        // 6. send the data
        await bluebird.all(
          dataPack.map(async d => this.comm.sendData2Node(d, 'localhost', 6666))
        )

        // 7. transmiting power consumption
        dataPack.map(d => this.power.doTransition())

        // 8. update power
        await this.superv.setPower(this.power.value)

        // 9. log to elastic
        this.stashLogger.sendLog({
          sensor: this.name,
          power: this.power.value,
          dataLoad: this.data.dataStore.length,
          numberOfMessageSent: dataPack.length,
          powerConsumption: originalPower - this.power.value
        })

        // 10. judge if sensor goes down (no power)
        if (this.power.value < 0) {
          // set 'off'
          await this.superv.setSwitch(false)
        }

        this.logger('>>>>>>>> SENSOR LIFECYCLE END?????... <<<<<<<<')
      } else {
        this.logger('>>>>>>>> SENSOR SLEEPING?????... <<<<<<<<')
      }
    }, envs.sensor.S_T_INTERVAL)
  }
}
