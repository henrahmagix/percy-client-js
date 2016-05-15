module.exports = {};

module.exports.ArgumentError = class ArgumentError extends Error {
    get name() {
        return this._name || (this._name = 'ArgumentError');
    }
};
