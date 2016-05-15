var spawnSync = require('child_process').spawnSync;
var PROCESS_OPTIONS = {
    encoding: 'utf8'
};

var ENV = process.env;

class RepoNotFoundError extends Error {};

var Environment = module.exports = {
    GIT_FORMAT_LINES: [
        'COMMIT_SHA:%H',
        'AUTHOR_NAME:%an',
        'AUTHOR_EMAIL:%ae',
        'COMMITTER_NAME:%an',
        'COMMITTER_EMAIL:%ae',
        'COMMITTED_DATE:%ai',
        // Note: order is important, this must come last because the regex is a multiline match.
        'COMMIT_MESSAGE:%B'
    ],

    Error: Error,
    RepoNotFoundError: RepoNotFoundError,

    get current_ci() {
        if (ENV['TRAVIS_BUILD_ID']) {
            return Symbol.for('travis');
        }
        if (ENV['JENKINS_URL'] && ENV['ghprbPullId']) {
            // Pull Request Builder plugin.
            return Symbol.for('jenkins');
        }
        if (ENV['CIRCLECI']) {
            return Symbol.for('circle');
        }
        if (ENV['CI_NAME'] && ENV['CI_NAME'] === 'codeship') {
            return Symbol.for('codeship');
        }
        if (ENV['DRONE'] === 'true') {
            return Symbol.for('drone');
        }
        if (ENV['SEMAPHORE'] === 'true') {
            return Symbol.for('semaphore');
        }
    },

    // @return [Hash] All commit data from the current commit. Might be empty if commit data could
    // not be found.
    get commit() {
        var _commit_sha = Environment._commit_sha;
        var output = Environment._raw_commit_output(_commit_sha || 'HEAD');

        // Use the specified SHA or, if not given, the parsed SHA at HEAD.
        commit_sha = _commit_sha || output && output.match(/COMMIT_SHA:(.*)/)[1];

        // If not running in a git repo, allow nils for certain commit attributes.
        var extract_or_nil = function (regex) {
            return (output && output.match(regex) || [null])[1];
        };
        return {
            // The only required attribute:
            branch: Environment.branch,
            // An optional but important attribute:
            sha: commit_sha,

            // Optional attributes:
            message: extract_or_nil(/COMMIT_MESSAGE:(.*)/m),
            committed_at: extract_or_nil(/COMMITTED_DATE:(.*)/),
            // These GIT_ environment vars are from the Jenkins Git Plugin, but could be
            // used generically. This behavior may change in the future.
            author_name: extract_or_nil(/AUTHOR_NAME:(.*)/)         || ENV['GIT_AUTHOR_NAME'],
            author_email: extract_or_nil(/AUTHOR_EMAIL:(.*)/)       || ENV['GIT_AUTHOR_EMAIL'],
            committer_name: extract_or_nil(/COMMITTER_NAME:(.*)/)   || ENV['GIT_COMMITTER_NAME'],
            committer_email: extract_or_nil(/COMMITTER_EMAIL:(.*)/) || ENV['GIT_COMMITTER_EMAIL']
        };
    },

    // @private
    get _commit_sha() {
        if (ENV['PERCY_COMMIT']) {
            return ENV['PERCY_COMMIT'];
        }

        switch (Environment.current_ci) {
            case Symbol.for('jenkins'):
                // Pull Request Builder Plugin OR Git Plugin.
                return ENV['ghprbActualCommit'] || ENV['GIT_COMMIT'];
            case Symbol.for('travis'):
                return ENV['TRAVIS_COMMIT'];
            case Symbol.for('circle'):
                return ENV['CIRCLE_SHA1'];
            case Symbol.for('codeship'):
                return ENV['CI_COMMIT_ID'];
            case Symbol.for('drone'):
                return ENV['DRONE_COMMIT'];
            case Symbol.for('semaphore'):
                return ENV['REVISION'];
        }
    },

    // @private
    _raw_commit_output: function (commit_sha) {
        var format = Environment.GIT_FORMAT_LINES.join('%n');    // "git show" format uses %n for newlines.
        var result = spawnSync('git', ['show', '--quiet', `${commit_sha}`, `--format="${format}"`], PROCESS_OPTIONS);
        if (result.status !== 0) {
            return;
        }
        return result.output && result.output[1].trim();
    },

    // The name of the current branch.
    get branch() {
        if (ENV['PERCY_BRANCH']) {
            return ENV['PERCY_BRANCH'];
        }

        var result;
        switch (Environment.current_ci) {
            case Symbol.for('jenkins'):
                result = ENV['ghprbTargetBranch'];
                break;
            case Symbol.for('travis'):
                var pull_request_number = Environment.pull_request_number;
                if (pull_request_number && ENV['TRAVIS_BRANCH'] === 'master') {
                    result = `github-pr-${pull_request_number}`;
                } else {
                    result = ENV['TRAVIS_BRANCH'];
                }
                break;
            case Symbol.for('circle'):
                result = ENV['CIRCLE_BRANCH'];
                break;
            case Symbol.for('codeship'):
                result = ENV['CI_BRANCH'];
                break;
            case Symbol.for('drone'):
                result = ENV['DRONE_BRANCH'];
                break;
            case Symbol.for('semaphore'):
                result = ENV['BRANCH_NAME'];
                break;
        }
        if (!result) {
            result = Environment._raw_branch_output;
        }
        if (result === '') {
            process.stderr.write('[percy] Warning: not in a git repo, setting PERCY_BRANCH to `master`.');
            result = 'master';
        }
        return result;
    },

    // @private
    get _raw_branch_output() {
        // Discover from local git repo branch name.
        var result = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], PROCESS_OPTIONS);
        return result.output && result.output[1].trim();
    },

    get repo() {
        if (ENV['PERCY_REPO_SLUG']) {
            return ENV['PERCY_REPO_SLUG'];
        }

        var result;
        switch (Environment.current_ci) {
            case Symbol.for('travis'):
                result = ENV['TRAVIS_REPO_SLUG'];
                console.log('travis', result);
                break;
            case Symbol.for('circle'):
                result = `${ENV['CIRCLE_PROJECT_USERNAME']}/${ENV['CIRCLE_PROJECT_REPONAME']}`;
                console.log('circle', result);
                break;
            case Symbol.for('semaphore'):
                result = ENV['SEMAPHORE_REPO_SLUG'];
                console.log('semaphore', result);
                break;
        }
        if (result) {
            console.log('result', result, typeof result);
            return result;
        } else {
            var origin_url = Environment._get_origin_url.trim();
            if (origin_url === '') {
                throw new Environment.RepoNotFoundError(
                    'No local git repository found. ' +
                    'You can manually set PERCY_REPO_SLUG to fix this.'
                );
            }
            console.log('origin_url', origin_url);
            var match = origin_url.match(/[:/]([^/]+\/[^/]+?)(\.git)?$/);
            if (!match) {
                throw new Environment.RepoNotFoundError(
                    `Could not determine repository name from URL: ${origin_url}\n` +
                    `You can manually set PERCY_REPO_SLUG to fix this.`
                );
            }
            console.log('match', match[1]);
            return match[1];
        }
    },

    get pull_request_number() {
        if (ENV['PERCY_PULL_REQUEST']) {
            return ENV['PERCY_PULL_REQUEST'];
        }

        switch (Environment.current_ci) {
            case Symbol.for('jenkins'):
                // GitHub Pull Request Builder plugin.
                return ENV['ghprbPullId'];
            case Symbol.for('travis'):
                if (ENV['TRAVIS_PULL_REQUEST'] !== 'false') {
                    return ENV['TRAVIS_PULL_REQUEST'];
                }
                break;
            case Symbol.for('circle'):
                if (ENV['CI_PULL_REQUESTS'] && ENV['CI_PULL_REQUESTS'] !== '') {
                    var splits = ENV['CI_PULL_REQUESTS'].split('/');
                    return splits[splits.length - 1];
                }
                break;
            case Symbol.for('codeship'):
                // Unfortunately, codeship always returns 'false' for CI_PULL_REQUEST. For now, return nil.
                break;
            case Symbol.for('drone'):
                return ENV['CI_PULL_REQUEST'];
            case Symbol.for('semaphore'):
                return ENV['PULL_REQUEST_NUMBER'];
        }
    },

    // A nonce which will be the same for all nodes of a parallel build, used to identify shards
    // of the same CI build. This is usually just the CI environment build ID.
    get parallel_nonce() {
        if (ENV['PERCY_PARALLEL_NONCE']) {
            return ENV['PERCY_PARALLEL_NONCE'];
        }

        switch (Environment.current_ci) {
            case Symbol.for('travis'):
                return ENV['TRAVIS_BUILD_NUMBER'];
            case Symbol.for('circle'):
                return ENV['CIRCLE_BUILD_NUM'];
            case Symbol.for('codeship'):
                return ENV['CI_BUILD_NUMBER'];
            case Symbol.for('semaphore'):
                return ENV['SEMAPHORE_BUILD_NUMBER'];
        }
    },

    get parallel_total_shards() {
        if (ENV['PERCY_PARALLEL_TOTAL']) {
            return Number(ENV['PERCY_PARALLEL_TOTAL']);
        }

        // Description of `.empty?` http://stackoverflow.com/a/888877/3150057
        switch (Environment.current_ci) {
            case Symbol.for('circle'):
                var envVar = 'CIRCLE_NODE_TOTAL';
                if (ENV[envVar] && ENV[envVar].length !== 0) {
                    return Number(ENV[envVar]);
                }
                break;
            case Symbol.for('travis'):
                // Support for https://github.com/ArturT/knapsack
                var envVar = 'CI_NODE_TOTAL';
                if (ENV[envVar] && ENV[envVar].length !== 0) {
                    return Number(ENV[envVar]);
                }
                break;
            case Symbol.for('semaphore'):
                return Number(ENV['SEMAPHORE_THREAD_COUNT']);
        }
    },

    // @private
    get _get_origin_url() {
        var result = spawnSync('git', ['config', '--get', 'remote.origin.url'], PROCESS_OPTIONS);
        if (result.error) {
            throw result.error;
        }
        return result.output && result.output[1];
    }
};
