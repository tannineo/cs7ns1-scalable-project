# cs7ns1-scalable-project

## Goal

> To implement a Body Area Network (BAN) simulation, with a somewhat P2P network routing fucntion inside.

The key part is the routing method. Once the routing method is determined, all other parts of the designs can be done based on it.

## Routing Method

## Architecture

The simulation will run in a docker environment.

With docker a single file can be used to describe a bunch of vitual machines and it's easy to set up.

Compared to AWS IoT:

- more cumtomizable, more work
- once done the coding job, the set up process is easy (AWS's webpage GUI is hard to use, GCP is better)
- not binded to a single cloud service (AWS)

The simulation will contain:

- `redis`: key-value memory storage for runtime configurations, some settings can be changed during runtime
- `elastic & logstash`: the log search engine & the log collecting server
  - `kibana`: the webpage ui of elastic, which also allows viewing data in charts
- our own sensors
  - use parameters (env variables) to initialize different sensors in from one set of code (the docker image)

## Key Factors

### Duty Cycle

### Communication & Why ZigBee

- simulation communications: UDP
  - datagrams are sent and never cared by sender, it's more like 'real' communications via radio connetions
- data encryption: since it's not our focus, we do not use encryption / or just pick one
  - in real world ZigBee will handle it (?)

Why using ZigBee? Not WiFi? Not Bluetooth?

### Power Comsumption: Communication vs Others (Processing and Sensoring)

### Data Capacity

There are no limit on the local data storage now but it will have one

Strategies should be considered when the local storage on a sensor is (nearly) full

### Security

Except communications, any other things we need to consider?

### Simulation Situation

- a node is charged / not charged: Do we really need to charge a BAN device?
  - or just replace it (so it does down for a while)
- when the position of the sensor changes

## Simulator / Sensor Design

## Visualization

## About
