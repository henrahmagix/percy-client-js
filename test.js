var argv = require('minimist')(process.argv.slice(2));

var jasmine = new (require('jasmine'));
jasmine.loadConfig({
    spec_dir: 'spec',
    spec_files: [
        '**/*[sS]pec.js'
    ],
    helpers: [
        '**/*[hH]elper.js'
    ],
    stopSpecOnExpectationFailure: false,
    random: true
});

if (typeof argv.seed === 'number') {
    jasmine.seed(argv.seed);
}

jasmine.execute();
