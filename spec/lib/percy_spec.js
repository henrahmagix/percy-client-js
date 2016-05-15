var Percy = require('../../lib/percy');
describe('Percy', function () {
    beforeEach(function () {
        Percy.reset();
    });
    afterEach(function () {
        Percy.reset();
    });
    describe('#client', function () {
        it('returns a Percy::Client that is passed the global config object by default', function () {
            config = Percy.config;
            expect(Percy.client.config).toBe(config);
        });
    });
    describe('#config', function () {
        it('returns a config object', function () {
            expect(Percy.config.api_url).toBe('http://localhost:3000/api/v1');
        });
    });
    describe('#logger', function () {
        it('returns a memoized logger instance', function () {
            logger = Percy.logger;
            expect(logger).toBe(Percy.logger);
            Percy.logger.debug('Test logging that should NOT be output');
            Percy.logger.info('Test logging that SHOULD be output');
            Percy.logger.error('Test logging that SHOULD be output');
            Percy.config.debug = true;
            Percy.logger.debug('Test logging that SHOULD be output');
        });
    });
    describe('#reset', function () {
        it('clears certain instance variables', function () {
            var old_config = Percy.client.config;
            var old_client = Percy.client;
            var old_logger = Percy.logger;
            Percy.reset();
            expect(old_config).not.toBe(Percy.config);
            expect(old_client).not.toBe(Percy.client);
            expect(old_logger).not.toBe(Percy.logger);
        });
    });
});
