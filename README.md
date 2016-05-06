## Build

npm install

## Standalone running

1. Edit launch.sh with host/port of redis server
2. Run launch.sh

For debugging, you can use the chrome extension Simple Websocket client. Connect to ws://localhost:8082

## Messages

StartStream - this will subscribe to the "spark-stream" redis channel and send any messages down untouched
StopStream - unsubscribes and stops the messages being delivered