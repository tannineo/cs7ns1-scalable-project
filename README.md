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
  - and light weight for runtime
- data encryption: since it's not our focus, we do not use encryption / or just pick one
  - in real world ZigBee will handle it (?)

So the sensors should:

- have a whole set of IPs and ports of each other to conmunicate

Why using ZigBee? Not WiFi? Not Bluetooth?

### Power Comsumption: Communication vs Others (Processing and Sensoring)

The should be a paper about the CURVE of range-comsumption.
And also a paper of the transmission/communication takes how much of the power of the whole system.

The sensors should:

- have a setting of how much energy it will consume to perform:
  - [x] data transmission
  - [x] maintenance (including sensoring and processing)
- a setting to determine the range of communication, including:
  - [x] maximum range mode
  - normal mode (power saving mode?)
    - can ZigBee control the range of itself? If so then only maximum is needed
- keep updating the power value in key-value storage
- send logs on power consumption details

### Data Capacity

There are no limit on the local data storage now but it will have one

Strategies should be considered when the local storage on a sensor is (nearly) full

### Security

Except communications, any other things we need to consider?

### Simulation Situation

We may face these situations in our simulation:

- a node is charged / not charged: Do we really need to charge a BAN device?
  - or just replace it (so it does down for a while)
- when the position of the sensor changes
- when there is a important data
- the 'sink' goes down
  - 'sink' is the center of our

So we (operators of simulations) can do changes during runtime on:

- a switch to turn on / off the sensor
  - also a heart beat (though we do not have to do it in a simulator)
- the power value
- the 'positions'(a set of coodinates)
- a switch of 'start sending important data'

## Simulator / Sensor Design

The code structure:

```text
index.js
   |
sensor.js                                   => envs.js => consts.js
   |                                            => coordinate.js
   +-------+-------+---------+--------+             => dummyData.json
   |       |       |         |        |
comm.js data.js superv.js power.js route.js
```

the lifecycle in one T:

- superv: update the sensor settings based on things in redis
- data: producing the sensor data
- power: routine energy consumption
- data: transmiting and deleting the stored data
- superv: update the sensor settings to redis

besides the lifecycle, the sensor will ALWAYS listen to the message

- data: listen and store the data


## Visualization

## About
