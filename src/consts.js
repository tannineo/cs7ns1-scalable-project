export default {
  /**
   * The difined sensor type
   */
  SENSOR_TYPE: {
    sink: 'sink',
    bodyTemp: 'bodyTemp',
    respiratoryMonitor: 'respiratoryMonitor',
    lacticAcidSensor: 'lacticAcidSensor',
    ecgSensor: 'ecgSensor',
    pulseOximeterSensor: 'pulseOximeterSensor',
    pHValue: 'pHValue',
    glucoseLevel: 'glucoseLevel',
    heartbeat: 'heartbeat'
  },
  DATA_TYPE: {
    DATA: 'data',
    HEARTBEAT_NODE2SINK: 'heartbeatNode2Sink',
    HEARTBEAT_SINK2NODE: 'heartbeatSink2Node',
    REGISTER_NODE2SINK: 'registerNode2Sink',
    REGISTER_SINK2NODE: 'registerSink2Node'
  }
}
