const sinon = require('sinon');
const KafkaLogger = require('../src/KafkaLogger');
const makeKafkaServer = require('kafka-please');

const testSpan = {
  traceId: 'testTraceId',
  id: 'testTraceId',
  name: 'get',
  kind: 'SERVER',
  timestamp: Date.now(),
  duration: 50000,
  annotations: [],
  tags: {},
  debug: false,
  shared: false,
};

describe('Kafka transport - unit tests', () => {
  let kafkaLogger;

  afterEach(() => {
    kafkaLogger.close();
  });

  it('Should start KafkaLogger successfully', function(done) {
    this.timeout(60 * 1000);

    const handleError = (err) => {
      // An error here will double call done to throw an error
      // since logSpan doesn't return a callback
      /* eslint-disable no-console */
      console.error(err);
      done(err);
    };

    makeKafkaServer().then(kafkaServer => {
      kafkaLogger = new KafkaLogger({
        clientOpts: {
          kafkaHost: `localhost:${kafkaServer.kafkaPort}`,
        },
        onError: handleError,
      });

      kafkaLogger.producer.on('ready', () => {
        expect(kafkaLogger.producerState).to.equal('ready');
        done();
      });
    });
  });

  it('Should send span to KafkaLogger successfully without error', function(done) {
    this.timeout(60 * 1000);

    const handleError = (err) => {
      console.error(err);
      done(err);
    };

    makeKafkaServer().then(kafkaServer => {
      kafkaLogger = new KafkaLogger({
        clientOpts: {
          kafkaHost: `localhost:${kafkaServer.kafkaPort}`,
        },
        onError: handleError,
      });

      kafkaLogger.producer.on('ready', () => {
        kafkaLogger.logSpan(testSpan);
        setTimeout(done, 2000);
      });
    });
  });

  it('Should throw errors gracefully when Kafka-Node fails to connect', function(done) {
    this.timeout(60 * 1000);

    const errorSpy = sinon.spy();

    kafkaLogger = new KafkaLogger({
      clientOpts: {
        topic: 'zipkin-test',
        kafkaHost: 'hostToFail',
        sessionTimeout: 1000,
        connectTimeout: 1000,
        connectRetryOptions: {
          retries: 0,
        },
      },
      producerOpts: {
        ackTimeoutMs: 1000,
      },
      onError: errorSpy,
    });

    setTimeout(() => {
      // Errors should be called for producer, client, and failed logSpan
      sinon.assert.calledTwice(errorSpy);
      done();
    }, 2000);
  });
});
