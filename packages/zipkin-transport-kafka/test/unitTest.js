const kafka = require('kafka-node');
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
}

describe('Kafka transport - unit tests', () => {
    let kafkaLogger;
    
    afterEach(() => {
        kafkaLogger.close();
    });

    it('should start KafkaLogger successfully', function(done) {
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

    it('should send data to KafkaLogger successfully', function(done) {
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
                done();
            });
        });
    });


    it('should throw errors gracefully when Kafka-Node fails to connect', function(done) {
        this.timeout(60 * 1000);

        const handleError = (err) => {
            expect(err.message).to.equal('connect ENOENT hostToFail')
        }

        const kafkaLogger = new KafkaLogger({
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
            onError: handleError,
        });

        kafkaLogger.logSpan(testSpan);

        setTimeout(() => {
            // Errors should be called for producer, client, and failed logSpan
            expect(handleError).to.have.been.calledThrice;
            done();
        }, 2000);
    });
});
