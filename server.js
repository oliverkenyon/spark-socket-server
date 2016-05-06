
"use strict";

class SocketServer {

	constructor(http, webSocketServerClass, redis) {
		this.webSocketServerclass = webSocketServerClass;
		this.http = http;
		this.redis = redis;
		this.isStarted = false;
		this.OPEN = 1;
	}

	start() {
		this.wss = new webSocketServerClass({ port: 8082 });
		this.wss.on('connection', ws => {
			this.log("Client connected");

			var clientOptions = {
				"host": process.env.REDIS_HOST,
				"port": process.env.REDIS_PORT
			}

			this.redisClient = redis.createClient(clientOptions);
			this.redisClient.on("error", (err) => {
    		this.log("RedisError:" + err);
			});

			ws.on("message", message => { this.onMessage(message); } );
			ws.on("close", () => { this.onClose(); } );
			this.ws = ws;
		});
	}

	log(message) {
		var date = new Date();
		console.info(date.toUTCString() + ": " + message);
	}

	onClose(message) {
		this.log("Socket closed");
		this.stopStream();
		this.redisClient.quit();
	}

	onMessage(message) {
		this.log("Message received: " + message);
		switch(message) {
			case "StartStream":
				this.startStream();
				break;
			case "StopStream":
				this.stopStream();
				break;
			default:
				this.log("Unknown message: " + message + " received");
				this.wss.send("Unknown message");
		}
	}

	startStream() {
		if (this.isStarted) {
			this.log("Already started");
			return;
		}

		this.isStarted = true;

		var channelName = "spark-stream";
		this.redisClient.subscribe(channelName);
		this.redisClient.on("message", (channel, message) => this.onRedisMessage(channel, message));
	}

	onRedisMessage(channel, message) {
		this.ws.send(message);
	}

	stopStream() {
		this.isStarted = false;
		this.redisClient.unsubscribe("spark-stream");
	}

}

var webSocketServerClass = require('ws').Server;
var http = require('http');
var redis = require("redis");
var socketServer = new SocketServer(http, webSocketServerClass, redis);
socketServer.start();
