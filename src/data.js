import envs from './envs.js'
import * as dummy from './dummyData.json'

/**
 *
 *
 *
 *
 */
export default class Data {
  logger
  loggerHandle

  dataType

  dataStore

  /**
   * the pointer / index to generate data
   */
  genDataPtr

  constructor(option) {
    this.loggerHandle = option.loggerHandle
    this.logger = require('debug')(this.loggerHandle + ':data')

    this.logger('data module init with option: %O', option)

    this.dataType = option.type
    this.genDataPtr = 0
    this.dataStore = []
  }

  /**
   * generate the sensor data
   */
  genData() {
    const dummyList = dummy[this.dataType]
    const index = this.genDataPtr++ % dummyList.length
    const data = dummyList[index]

    this.logger('gen data: %O', { genDataPtr: this.genDataPtr, index, data })

    return data
  }

  pushData(data) {
    this.dataStore.push(data)

    this.logger('pushData : %O', {
      dataPushed: data,
      dataStoreSize: this.dataStore.length
    })
  }

  popData() {
    const data = this.dataStore.pop()

    this.logger('popData : %O', {
      dataPopped: data,
      dataStoreSize: this.dataStore.length
    })

    return data
  }
}
