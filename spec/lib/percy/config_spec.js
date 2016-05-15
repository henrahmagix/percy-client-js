var ENV = process.env;
var Percy = require.main.require('./lib/percy');
describe('Percy::Config', function () {
    beforeEach(function () {
        this.config = Percy.config;
    });

    it('returns the correct defaults', function () {
        expect(this.config.keys).toBe([
            null,
            ENV['PERCY_API'],
            false,
            'percy/percy-client',
            []
        ]);
        expect(this.config.access_token).toBe(null);
        expect(this.config.api_url).toBe(ENV['PERCY_API']);
        expect(this.config.debug).toBe(false);
        expect(this.config.repo).toBe('percy/percy-client');
        expect(this.config.default_widths).toBe([]);
    });
});
