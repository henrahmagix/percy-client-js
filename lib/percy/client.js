// require 'json'
// require 'percy/config'
// require 'percy/client/environment'
// require 'percy/client/connection'
// require 'percy/client/version'
// require 'percy/client/builds'
// require 'percy/client/snapshots'
// require 'percy/client/resources'

var Config = require('./config');

var Environment = require('./client/environment');
var Connection = require('./client/connection');
var Builds = require('./client/builds');
var Snapshots = require('./client/snapshots');
var Resources = require('./client/resources');

class TimeoutError extends Error {};
class ConnectionFailed extends Error {};
class HttpError extends Error {

    get status() {
        return this._status;
    }
    // No setter

    get method() {
        return this._method;
    }
    // No setter

    get url() {
        return this._url;
    }
    // No setter

    get body() {
        return this._body;
    }
    // No setter

    constructor(status, method, url, body, ...args) {
        this._status = status;
        this._method = method;
        this._url = url;
        this._body = body;
        super(...args);
    }
};

class ClientError extends HttpError {};    // 4xx;
class BadRequestError extends ClientError {};    // 400.
class UnauthorizedError extends ClientError {};    // 401.
class PaymentRequiredError extends ClientError {};    // 402.
class ForbiddenError extends ClientError {};    // 403.
class NotFoundError extends ClientError {};    // 404.
class ConflictError extends ClientError {};    // 409.

class ServerError extends HttpError {};    // 5xx.
class InternalServerError extends ServerError {};    // 500.
class BadGatewayError extends ServerError {};    // 502.
class ServiceUnavailableError extends ServerError {};    // 503.

module.exports = class Client {

    constructor(options = {}) {
        // Mixins.
        Object.assign(this, Connection);
        Object.assign(this, Builds);
        Object.assign(this, Snapshots);
        Object.assign(this, Resources);
        this._config = options.config || new Config();
    }

    get config() {
        return this._config;
    }
    // No setter

};
module.exports.Error = Error;
module.exports.TimeoutError = TimeoutError;
module.exports.ConnectionFailed = ConnectionFailed;
module.exports.HttpError = HttpError;
module.exports.ClientError = ClientError;
module.exports.BadRequestError = BadRequestError;
module.exports.UnauthorizedError = UnauthorizedError;
module.exports.PaymentRequiredError = PaymentRequiredError;
module.exports.ForbiddenError = ForbiddenError;
module.exports.NotFoundError = NotFoundError;
module.exports.ConflictError = ConflictError;
module.exports.ServerError = ServerError;
module.exports.InternalServerError = InternalServerError;
module.exports.BadGatewayError = BadGatewayError;
module.exports.ServiceUnavailableError = ServiceUnavailableError;

// Inferred by Ruby module.
module.exports.Environment = Environment;
