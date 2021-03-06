# Percy::Client fork in NodeJS

[![Build Status](https://travis-ci.org/henrahmagix/percy-client-js.svg?branch=master)](https://travis-ci.org/henrahmagix/percy-client-js)
[![Node Version](https://badge.fury.io/npm/percy-client-js.svg)](http://badge.fury.io/npm/percy-client-js)

Original at [https://github.com/percy/percy-client](https://github.com/percy/percy-client)

#### Docs here: [https://percy.io/docs/api/client](https://percy.io/docs/api/client)

## Tests

- `npm test`

### Random order

Run specs in random order to surface order dependencies. If you find an order dependency and want to debug it, you can fix the order by providing the seed, which is printed after each run.
```
4 specs, 0 failures
Finished in 0.007 seconds
Randomized with seed 1234
```

Seed global randomization in this process using the `--seed` CLI option. Setting this allows you to use `--seed` to deterministically reproduce test failures related to randomization by passing the same `--seed` value as the one that triggered the failure.
- `npm test -- --seed=1234`

Note the `--` separating the command from the arguments: this is required by `npm run-scripts`. See http://stackoverflow.com/a/14404223/3150057
