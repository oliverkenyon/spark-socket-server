#! /usr/bin/env bash
# Use to launch locally on Wincows, not needed for docker container
export REDIS_HOST='192.168.99.100'
export REDIS_PORT='6379'

node server.js
