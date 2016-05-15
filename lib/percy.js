var Client = require('./percy/client');
var Config = require('./percy/config');

class LoggerError extends Error {
    get name() {
        return this._name || (this._name = 'LoggerError');
    }
};

class Logger {

    constructor(writable_stream) {
        if (
            writable_stream &&
            writable_stream.writable &&
            writable_stream.write instanceof Function
        ) {
            this.writable_stream = writable_stream;
        } else {
            throw new LoggerError('Constructor argument must be a writable stream');
        }
    }

    get level() {
        return this._level;
    }
    set level(level) {
        if (!(level in Logger)) {
            throw new LoggerError('Level unavailable: ' + level);
        }
        this._level = level;
    }

    get formatter() {
        return this._formatter || function () {
            return Array.from(arguments).join();
        };
    }
    set formatter(formatter) {
        this._formatter = formatter;
    }

    log(level, msg) {
        var formatter = this.formatter;
        var log_msg = this.formatter(level, new Date(), process.title, msg);
        return this.writable_stream.write(log_msg);
    }

    debug(msg) {
        if (this.level === Logger.DEBUG) {
            return this.log(Logger.DEBUG, msg);
        }
        return false;
    }

    info(msg) {
        return this.log(Logger.INFO, msg);
    }

    error(msg) {
        return this.log(Logger.ERROR, msg);
    }

};
Logger.DEBUG = 'DEBUG';
Logger.INFO = 'INFO';
Logger.ERROR = 'ERROR';

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
        if (!this._logger) {
            this._logger = new Logger(process.stdout);
        }
        this._logger.level = this.config.debug ? Logger.DEBUG : Logger.INFO;
        this._logger.formatter = (severity, datetime, progname, msg) => {
            return `[percy][${severity}] ${msg}\n`;
        };
        return this._logger;
    }

};
module.exports.Client = Client;
module.exports.Config = Config;
