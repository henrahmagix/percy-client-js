var Percy = require.main.require('./lib/percy');
describe('Percy.Client', function () {
    describe('config', function () {
        it('returns the config object given when initialized', function () {
            var config = new Percy.Config();
            var client = new Percy.Client({config: config});
            expect(client.config).toBe(config);
        });
    });
});
