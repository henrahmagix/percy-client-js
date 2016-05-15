var ENV = process.env;
var Config = require.main.require('./lib/percy/config');
describe('Percy::Config', function () {
    beforeEach(function () {
        this.config = new Config();
    });

    it('returns the correct defaults', function () {
        expect(this.config.keys).toEqual([
            undefined,
            ENV['PERCY_API'],
            false,
            'henrahmagix/percy-client-js',
            []
        ]);
        expect(this.config.access_token).toBe(undefined);
        expect(this.config.api_url).toBe(ENV['PERCY_API']);
        expect(this.config.debug).toBe(false);
        expect(this.config.repo).toBe('henrahmagix/percy-client-js');
        expect(this.config.default_widths).toEqual([]);
    });
});
