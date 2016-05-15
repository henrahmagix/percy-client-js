var ENV = process.env;

var Environment = require('./client/environment');

module.exports = class Config {

    // List of configurable keys for {Percy::Client}
    // @return [Array] Option keys.
    get keys() {
        return this._keys || (this._keys = [
            this.access_token,
            this.api_url,
            this.debug,
            this.repo,
            this.default_widths
        ]);
    }
    // No setter

    // attr_accessor
    // @!attribute [w] access_token
    //     @return [String] Percy repo access token.
    get access_token() {
        return this._access_token || (this._access_token = ENV['PERCY_TOKEN']);
    }
    set access_token(access_token) {
        this._access_token = access_token;
    }

    // attr_accessor
    // @!attribute api_url
    //     @return [String] Base URL for API requests. Default: https://percy.io/api/v1/
    get api_url() {
        return this._api_url || (this._api_url = ENV['PERCY_API'] || 'https://percy.io/api/v1');
    }
    set api_url(api_url) {
        this._api_url = api_url;
    }

    // attr_accessor
    // @!attribute debug
    //     @return [Boolean] Whether or not to enable debug logging.
    get debug() {
        return this._debug || (this._debug = ENV['PERCY_DEBUG'] == '1');
    }
    set debug(debug) {
        this._debug = debug;
    }

    // attr_read
    // @!attribute repo
    //     @return [String] Git repo name.
    get repo() {
        return this._repo || (this._repo = Environment.repo);
    }
    set repo(repo) {
        this._repo = repo;
    }

    // attr_accessor
    // @!attribute default_widths
    //     @return [Array] List of default widths for snapshot rendering unless overridden.
    get default_widths() {
        return this._default_widths || (this._default_widths = []);
    }
    set default_widths(default_widths) {
        this._default_widths = default_widths;
    }

};
