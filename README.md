# cs7ns1-scalable-project

## Goal

> To implement a Body Area Network (BAN) simulation, with a somewhat P2P network routing fucntion inside.

The key part is the routing method. Once the routing method is determined, all other parts of the designs can be done based on it.

## Routing Method

All the sensor will:

- conmunicate with the sink to get the forwarding node
- have a heartbeat with the sink
- if one node goes down (no heartbeat) the sink will send new forwarding node

## Architecture

The simulation will run in a docker environment.

With docker a single file (Dockerfile for the image and docker-compose for the whoel cluster) can be used to describe a bunch of vitual machines and it's easy to set up.

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

### Communication & Why ZigBee

- simulation communications: UDP
  - datagrams are sent and never cared by sender, it's more like 'real' communications via radio connetions
  - and light weight for runtime
- data encryption: since it's not our focus, we do not use encryption / or just pick one
  - in real world ZigBee will handle it

So the sensors should:

- have a whole set of IPs and ports of each other to conmunicate

Why using ZigBee? Not WiFi? Not Bluetooth?

```bib
@INPROCEEDINGS{8070716,
author={N. V. R. {Kumar} and C. {Bhuvana} and S. {Anushya}},
booktitle={2017 International Conference on Information Communication and Embedded Systems (ICICES)},
title={Comparison of ZigBee and Bluetooth wireless technologies-survey},
year={2017},
volume={},
number={},
pages={1-4},
keywords={Bluetooth;protocols;Zigbee;ZigBee;wireless networking standards;Bluetooth wireless technologies;remote control;sensor application;radio environments;protocols;ZigBee;Bluetooth;Protocols;Wireless communication;Wireless sensor networks;Communication system security;Security;ZigBee;Bluetooth;mobile user;GPS},
doi={10.1109/ICICES.2017.8070716},
ISSN={null},
month={Feb},}
```

### Power Comsumption: Communication vs Others (Processing and Sensoring)

There should be a paper about the CURVE of range-comsumption.
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

```bib
@INPROCEEDINGS{7289160,
author={M. {Moid Sahndhu} and N. {Javaid} and M. {Imran} and M. {Guizani} and Z. A. {Khan} and U. {Qasim}},
booktitle={2015 International Wireless Communications and Mobile Computing Conference (IWCMC)},
title={BEC: A novel routing protocol for balanced energy consumption in Wireless Body Area Networks},
year={2015},
volume={},
number={},
pages={653-658},
keywords={body area networks;routing protocols;BEC;novel routing protocol;wireless body area networks;WBAN;balanced energy consumption;relay nodes;Energy consumption;Routing protocols;Monitoring;Body area networks;Routing;Wireless communication;WBANs;balanced energy consumption;efficiency;network lifetime;throughput},
doi={10.1109/IWCMC.2015.7289160},
ISSN={2376-6506},
month={Aug},}
```

### Data Capacity

There are no limit on the local data storage now but it will have one

Strategies should be considered when the local storage on a sensor is (nearly) full

### Security

Except communications, other things we need to consider:

- encryption:
  - SSL?
  - data encoding with protobuf?

### Simulation Situation

We may face these situations in our simulation:

- A node is charged / not charged:
  - Do we really need to charge a BAN device?
  - Or just replace it (so it does down for a while)
- When the position of the sensor changes
- Power to a level: dump the data to the nearest node

Things still need to consider:

- when there is a important data
- the 'sink' goes down
  - 'sink' is the center of our

So we (operators of simulations) can do changes during runtime on:

- a switch to turn on / off the sensor
- the power value
- the 'positions'(a set of coodinates)
- a switch of 'start sending important data'

## Simulator / Sensor Design

The code structure:

```text
index.js
   |
sensor.js                                       => envs.js => consts.js
   |                                                => coordinate.js  // the class containing position also methods to calculate
   +-------+-------+---------+--------+                 => dummyData.json  // the dummy sensor data
   |       |       |         |        |                     => stashLogger.js  // send log to Logstash
   |       |       |         |        |
comm.js data.js superv.js power.js route.js
```

the lifecycle in one T:

1. superv: update the sensor settings based on things in redis:
   - switch on / off
   - power
   - position
2. data: producing the sensor data
3. power: routine energy consumption
4. data: pop (a limited amout of) data from the stored data
5. comm: calculate the route & transmitting the data
6. comm: send the data
7. power: transmiting energy consumption
8. superv: update the sensor status to redis:
   - power
9. log: send metrics to Logstash
   - sensor_name
     - power
     - data load
     - number of message sent
     - power comsumption
     - other routing tracks???
10. is the sensor down (power)?????

besides the lifecycle, the sensor will ALWAYS listen to the message, so the the sensor parallel the data receiving process

- data: listen and store the data

## Visualization

Use the elastic logstash kibana docker image ([elk](https://hub.docker.com/r/sebp/elk)) to do the log collecting and visualization.
The documentation: https://elk-docker.readthedocs.io/#elasticsearch-logstash-kibana-elk-docker-image-documentation

exposed ports:

- `5601` (Kibana web interface).
- `9200` (Elasticsearch JSON interface).
- `5044` (Logstash Beats interface, receives logs from Beats such as Filebeat – see the Forwarding logs with Filebeat section).

```sh
docker run --name elkt -p 5601:5601 -p 9200:9200 -p 5044:5044 -p 7777:7777/udp tannineo/elk-udp-docker
```

Or installing and running ELK in you own machine with package managers available.

## Simulation Operations

To run sensors and sink in dev env.

```shell
yarn dev # the sensor has default setting values in envs.js
S_SINK_HOST=6660 S_SERVER_PORT=6661 S_SENSOR_NAME=sensor213 S_SENSOR_TYPE=lacticAcidSensor S_POS_X=5 S_POS_Y=5 yarn dev
S_SINK_HOST=6660 S_SERVER_PORT=6662 S_SENSOR_NAME=sensor2133 S_POS_X=4 S_POS_Y=4 yarn dev
S_SENSOR_TYPE=sink S_SERVER_PORT=6660 S_SENSOR_NAME=sink yarn dev # the sink
```

## Further Works

- refactor the code
  - reading values from envs everywhere (NOT GOOD)
  - security issues:
    - encryption
    - encoding
    - fault tolerance

## About

The project is discarded (for the module) due to the time constraints.
Still need perfection.
