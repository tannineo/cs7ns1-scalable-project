import * as bluebird from 'bluebird'
import * as dgram from 'dgram'
import * as _ from 'lodash'

import envs from './envs.js'
import consts from './consts.js'
import Coordinate from './coordinate.js'
import Data from './Data.js'
import Power from './Power.js'
import Comm from './Comm.js'
import SuperV from './superv.js'
import StashLogger from './stashLogger.js'
import { jsxText } from '@babel/types'

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
   * data generation and storage
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

  /**
   * for node: forwarding node info, will have
   *
   * name
   * ip
   * port
   */
  forwardingNodeInfo

  /**
   * for node: heartbeat counter
   */
  heartbeatCounter

  /**
   * for sink: heartbeat storage
   */
  heartbeatArray

  /**
   * the route layer of sensors
   *
   * 2d array will have
   *
   * name
   * coor
   *  x y
   * toName
   *
   */
  routeLayers

  server

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
      name: this.name,
      handlers: {
        data: this.commHandlerData,
        heartbeatNode2Sink: this.commHandlerHeartbeatSink,
        heartbeatSink2Node: this.commHandlerHeartbeatNode,
        registerNode2Sink: this.commHandlerRegisterSink,
        registerSink2Node: this.commHandlerRegisterNode
      }
    }
    this.power = new Power(option)
    this.comm = new Comm(option)
    this.data = new Data(option)
    this.superv = new SuperV(option)
    this.stashLogger = new StashLogger(option)

    this.heartbeatCounter = 0
    this.heartbeatArray = []
    this.routeLayers = [[], []]
  }

  async init() {
    this.logger('>>>>>>>> SENSOR / SINK INITIALIZING... <<<<<<<<')
    // initialize
    await bluebird.all([
      this.superv.setPosition({
        x: envs.sensor.S_POS_X,
        y: envs.sensor.S_POS_Y
      }),
      this.superv.setPower(envs.sensor.S_MAX_POWER)
    ])

    this.server = dgram.createSocket(envs.udp.S_UDP_TYPE)

    // start binding
    this.server.bind(envs.udp.S_SERVER_PORT)

    // listening event
    this.server.on('listening', () => {
      this.logger('sensor listening on %O', {
        port: envs.udp.S_SERVER_PORT
      })
    })

    // register event
    this.server.on('message', (buf, rinfo) => {
      let data = {}
      try {
        data = JSON.parse(buf.toString('utf8'))
      } catch {
        data = { event: 'error' }
      }

      // TODO: register data handling cb
      switch (data.event) {
        case 'data':
          this.commHandlerData(data)
          break
        case 'heartbeatNode2Sink':
          this.commHandlerHeartbeatSink(data)
          break
        case 'heartbeatSink2Node':
          this.commHandlerHeartbeatNode(data)
          break
        case 'registerNode2Sink':
          this.commHandlerRegisterSink(data)
          break
        case 'registerSink2Node':
          this.commHandlerRegisterNode(data)
          break
        case 'error':
        default:
          this.logger('server received message but error occurs')
      }

      this.logger('server received message: %O', {
        data,
        rinfo
      })
    })
  }

  async run() {
    // TODO register????

    // lifecycle
    this.interval = setInterval(async () => {
      // check if the sensor is off
      if (this.superv.getSwitch()) {
        this.logger('>>>>>>>> SENSOR LIFECYCLE START?????... <<<<<<<<')

        // 0. update sensor settings
        this.power.value = await this.superv.getPower()
        this.comm.coor = await this.superv.getPosition()
        const originalPower = this.power.value

        // 1. heartbeat
        this.heartbeatCounter++
        if (this.heartbeatCounter % 5 === 0) {
          // TODO send heartbeat to sink
          this.comm.sendData2Node(
            {
              from: this.name,
              route: [this.name],
              host: envs.udp.S_SERVER_HOST,
              port: envs.udp.S_SERVER_PORT,
              coor: {
                x: this.comm.coor.x,
                y: this.comm.coor.y
              }
            },
            'localhost',
            6660,
            consts.DATA_TYPE.HEARTBEAT_NODE2SINK
          )
        }
        this.power.doTransition()

        // 2. producing sensor data
        const gd = this.data.genData()
        this.data.pushData(gd)

        // 3. routine power consumption
        this.power.doRoutine()

        // 4. pop data from data store
        // TODO: hard code send 5 datapacks at a time
        const dataPack = []
        for (let i = 0; i < 5; i++) {
          const d = this.data.popData()
          if (d) {
            dataPack.push(d)
          }
        }

        // 5. calculate the nearest route
        // using the forwardingNodeInfo
        // TODO: delete this hard coded node
        if (this.forwardingNodeInfo) {
          // 6. send the data
          // TODO change it using forwardingNodeInfo
          await bluebird.all(
            dataPack.map(async d =>
              this.comm.sendData2Node(
                d,
                this.forwardingNodeInfo.host,
                this.forwardingNodeInfo.port,
                'data'
              )
            )
          )
        } else {
          this.logger('skip comm send data: no forwardingNodeInfo')
        }

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

  async runSink() {
    this.interval = setInterval(async () => {
      this.logger('>>>>>>>> SINK LIFECYCLE START... <<<<<<<<')
      // 0. update sink info
      this.comm.coor = await this.superv.getPosition()

      // 1. check heartbeat
      this.sinkCheckHeartbeat()

      // 2. check routings
      this.sinkUpdateRoute()

      // 3. comsume all data in the store
      this.sinkConsumeData()

      this.logger('>>>>>>>> SINK LIFECYCLE END... <<<<<<<<')
    }, envs.sensor.S_T_INTERVAL)
  }

  /**
   * for sink: iterate all the senso
   */
  sinkCheckHeartbeat() {
    this.logger('sinkCheckHeartbeat start')
    for (let i = 0; i < this.heartbeatArray.length; i++) {
      if (
        this.heartbeatArray[i].createTime + envs.sensor.S_HEARTBEAT_TIMEOUT <
        Date.now()
      ) {
        this.heartbeatArray.splice(i, 1)
        this.logger('sinkCheckHeartbeat heartbeat lost %O', {
          sensorName: this.heartbeatArray[i].from
        })
      }
    }
    this.logger('sinkCheckHeartbeat end result : %O', this.heartbeatArray)
  }

  checkIsInHeartbeatArray(name) {
    for (let i = 0; i < this.heartbeatArray.length; i++) {
      if (this.heartbeatArray[i].from === name) return true
    }

    return false
  }

  /**
   * for sensor: iterate the routeLayers and update
   */
  sinkUpdateRoute() {
    this.logger('sinkUpdateRoute start')

    // 0. new routeLayers
    const newRouteLayers = [[], []]

    // 1. iterate all and update the routing
    for (const node of this.heartbeatArray) {
      // cal sink distance
      const sinkDist = Coordinate.calDistence(node.coor, this.comm.coor)
      // sensor in the default range, directly connect
      if (sinkDist < envs.sensor.S_MAX_RANGE) {
        node.sinkDist = sinkDist

        this.logger('sinkUpdateRoute node direct connect %O', {
          node,
          sinkDist
        })

        node.to = {
          name: this.name, // to 'sink'
          host: envs.udp.S_SERVER_HOST,
          port: envs.udp.S_SERVER_PORT,
          coor: this.comm.coor
        }
        newRouteLayers[0].push(node)
      }
    }

    // 2. the nearest node vs sensor
    for (const node of this.heartbeatArray) {
      // cal sink distance
      const sinkDist = Coordinate.calDistence(node.coor, this.comm.coor)

      // continue if exists
      let flag = false
      for (let i = 0; i < newRouteLayers[0].length; i++) {
        if (newRouteLayers[0][i].from === node.name) {
          flag = true
          break
        }
      }
      if (flag) continue

      flag = false
      for (let i = 0; i < newRouteLayers[0].length; i++) {
        const nodeDist = Coordinate.calDistence(
          newRouteLayers[0][i].coor,
          node.coor
        )
        if (
          Math.pow(nodeDist, 2) + Math.pow(newRouteLayers[0][i].sinkDist, 2) <
          Math.pow(sinkDist, 2)
        ) {
          this.logger('sinkUpdateRoute node indirect connect %O', {
            node,
            sinkDist
          })
          node.sinkDist = sinkDist
          node.to = {
            name: newRouteLayers[0][i].from,
            host: newRouteLayers[0][i].host,
            port: newRouteLayers[0][i].port,
            coor: newRouteLayers[0][i].coor
          }
          newRouteLayers[1].push(node)
          flag = true
          break
        }
      }

      // 3. direct connect sink (no choice)
      if (!flag) {
        this.logger('sinkUpdateRoute node direct connect (no choice) %O', {
          node,
          sinkDist
        })
        node.sinkDist = sinkDist
        node.to = {
          name: this.name, // to 'sink'
          host: envs.udp.S_SERVER_HOST,
          port: envs.udp.S_SERVER_PORT,
          coor: this.comm.coor
        }
        newRouteLayers[0].push(node)
      }
    }
    this.routeLayers = newRouteLayers

    this.logger('sinkUpdateRoute result %O', this.routeLayers)
  }

  /**
   * for sink: the sink consume all the data from dataStorage
   */
  sinkConsumeData() {
    this.logger(
      'sinkConsumeData sending all the data to the cloud (elastic) %O',
      {
        dataLength: this.data.dataStore.length
      }
    )

    let d = this.data.popData()
    while (!_.isUndefined(d)) {
      d.sinkComsumeAt = Date.now()
      this.stashLogger.sendLog(d)
      d = this.data.popData()
    }
  }

  commHandlerRegisterSink(udpData) {
    this.logger('commHandlerRegisterSink receive data: %O', udpData)

    // set the temp storage
    let flag = false
    for (let i = 0; i < this.heartbeatArray.length; i++) {
      if (this.heartbeatArray[i].from === udpData.from) {
        flag = true
        this.heartbeatArray[i].createTime = Date.now()
      }
    }
    if (!flag) {
      this.heartbeatArray.push(udpData)
    }

    this.comm.sendData2Node(
      {
        name: consts.SENSOR_TYPE.sink,
        host: envs.udp.S_SERVER_HOST,
        port: envs.udp.S_SERVER_PORT,
        coor: {
          x: this.comm.coor.x,
          y: this.comm.coor.y
        }
      },
      udpData.host,
      udpData.port,
      consts.DATA_TYPE.REGISTER_SINK2NODE
    )
  }

  commHandlerRegisterNode(udpData) {
    this.logger('commHandlerRegisterNode receive data: %O', udpData)

    // update forwardingNodeInfo
    this.forwardingNodeInfo = udpData
    this.logger(
      'commHandlerRegisterNode update forwardingNodeInfo: %O',
      this.forwardingNodeInfo
    )
  }

  /**
   * for sink: find the route for one node 'name'
   * @param {*} udpData
   */
  findRouteSettings(name) {
    this.logger(
      'findRouteSettings find route for ' + name + ' in %O',
      this.routeLayers
    )
    for (let i = 0; i < this.routeLayers.length; i++) {
      for (let j = 0; j < this.routeLayers[i].length; j++) {
        if (this.routeLayers[i][j].from === name) {
          this.logger(
            'findRouteSettings route found... %O',
            this.routeLayers[i][j]
          )
          return this.routeLayers[i][j].to
        }
      }
    }

    // not found return sink directly
    this.logger(
      'findRouteSettings route not found! findRouteSettings return sink directly'
    )
    return {
      name: consts.SENSOR_TYPE.sink,
      host: envs.udp.S_SERVER_HOST,
      port: envs.udp.S_SERVER_PORT,
      coor: {
        x: this.comm.coor.x,
        y: this.comm.coor.y
      }
    }
  }

  /**
   * for sink: handle the udpData from node
   * will have:
   *
   * from: sensorName
   *
   * @param {*} udpData
   */
  commHandlerHeartbeatSink(udpData) {
    this.logger('commHandlerHeartbeatSink received data: %O', udpData)

    // set the temp storage
    let flag = false
    for (let i = 0; i < this.heartbeatArray.length; i++) {
      if (this.heartbeatArray[i].from === udpData.from) {
        flag = true
        this.heartbeatArray[i].createTime = Date.now()
      }
    }
    if (!flag) {
      this.heartbeatArray.push(udpData)
    }

    // return the forwardingNodeInfo
    const routeInfo = this.findRouteSettings(udpData.from)

    this.comm.sendData2Node(
      routeInfo,
      udpData.host,
      udpData.port,
      consts.DATA_TYPE.HEARTBEAT_SINK2NODE
    )
  }

  /**
   * for node:
   * udpData will have:
   *   * @param {*} udpData
   */
  commHandlerHeartbeatNode(udpData) {
    this.logger('commHandlerHeartbeatNode received data: %O', udpData)

    // update forwardingNodeInfo
    this.forwardingNodeInfo = udpData
    this.logger(
      'commHandlerHeartbeatNode update forwardingNodeInfo: %O',
      this.forwardingNodeInfo
    )
  }

  commHandlerData(udpData) {
    this.logger('commHandlerData received data: %O', udpData)

    // record the route data
    udpData.route.push(this.name)

    this.data.pushData(udpData)
  }
}
