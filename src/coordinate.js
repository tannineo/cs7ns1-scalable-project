import * as _ from 'lodash'

export default class Coordinate {
  x
  y

  constructor(x, y) {
    this.x = x
    this.y = y
  }

  static calDistence = (coor1, coor2) => {
    return Math.sqrt(
      Math.pow(coor1.x - coor2.x, 2) + Math.pow(coor1.y - coor2.y, 2)
    )
  }

  /**
   * cal the nearest node from the list
   *
   * coorPairList may look like:
   * [{
   *   coor: Coordinate,
   *   name: name of sensor,
   * }]
   *
   *
   * @param {*} coorPairList
   */
  calNearest(coorPairList) {
    if (_.isEmpty(coorPairList)) return null

    _.reduce(
      _.map(coorPairList, coorPair => {
        return {
          coorPair: coorPair,
          distance: this.calDistence(this, coorPair.coor)
        }
      }),
      (nearestTilNow, coorDisPair) => {
        // intial
        if (_.isNull(nearestTilNow)) return coorDisPair

        // compare
        if (coorDisPair.distance < nearestTilNow.distance) return coorDisPair
        else return nearestTilNow
      },
      null
    )
  }
}
