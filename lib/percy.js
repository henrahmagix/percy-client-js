// require 'logger'
var Client = require('./percy/client');
var Config = require('./percy/config');

// module is an object
// attach classes to object e.g. Percy.Client and Percy.Client.Connection
// @ instance variables are available in classes, so they must be mixed in?

// MOCK
class Logger {

};
Logger.DEBUG = 'DEBUG';
Logger.INFO = 'INFO';

var Percy = module.exports = {

    get config() {
        return this._config || (this._config = new Config());
    },

    reset: function () {
        this._config = null;
        this._client = null;
        this._logger = null;
    },

    /*
    API client based on configured options.

    @return [Percy::Client] API client.
    */
    get client() {
        return this._client || (this._client = new Client({config: this.config}));
    },

    get logger() {
        if (this._logger) {
            return this._logger;
        }
        this._logger = new Logger(process.stdout);
        this._logger.level = this.config.debug ? Logger.DEBUG : Logger.INFO;
        this._logger.formatter = (severity, datetime, progname, msg) => {
            return `[percy][${severity}] ${msg}\n`;
        };
        return this._logger;
    }

};
module.exports.Client = Client;
module.exports.Config = Config;
