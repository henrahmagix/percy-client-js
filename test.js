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
    random: false
});

jasmine.execute();
