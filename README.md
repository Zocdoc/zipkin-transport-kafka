# Zipkin-transport-kafka

**This is a fork of the openzipkin module, which has an unhandled error in promise bug: https://github.com/openzipkin/zipkin-js/pull/213

This bug is in the zipkin-transport-kafka module.

Until they release a new version with this fix, we will use this fork.

If further edits to this fork are made in the zipkin-transport-kafka module, pushes can be made directly. If edits need to be made to other submodules, the lerna-publish script within package.json must be written such that lerna identifies which packages have been changed, and which are not. This requires removing the --scope argument.**

This is a module that sends Zipkin trace data from zipkin-js to Kafka.

## Usage:

`npm install zipkin-transport-kafka --save`

```javascript
const {Tracer, BatchRecorder} = require('zipkin');
const {KafkaLogger} = require('zipkin-transport-kafka');

const kafkaRecorder = new BatchRecorder({
  logger: new KafkaLogger({
    clientOpts: {
      connectionString: 'localhost:2181'
    }
  })
});

const tracer = new Tracer({
  recorder,
  ctxImpl, // this would typically be a CLSContext or ExplicitContext
  localServiceName: 'service-a' // name of this application
});
```

If you do not use zookeeper to store offsets, use `clientOpts.kafkaHost` instead of `clientOpts.connectionString`.

```js
const {BatchRecorder} = require('zipkin');
const {KafkaLogger} = require('zipkin-transport-kafka');

const kafkaRecorder = new BatchRecorder({
  logger: new KafkaLogger({
    clientOpts: {
      kafkaHost: 'localhost:2181'
    }
  })
});
```
