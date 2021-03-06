var Percy = require.main.require('./lib/percy');
var ENV = process.env;
describe('Percy.Config', function () {
    beforeEach(function () {
        this.config = new Percy.Config();
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
