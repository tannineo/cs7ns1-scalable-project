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
- `elastic`: the log collecting server
  - `kibana`: the webpage ui of elastic, allow also viewing data in charts
- our own sensors

## Key Factors

### Duty Cycle

### Why ZigBee

### Power Comsumption: Communication vs Others (Processing and Sensoring)

### Data Capacity

### Simulation Situation

## Simulator / Sensor Design

## Visualization

## About
