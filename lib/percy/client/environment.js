var execSync = require('child_process').execSync;

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
        if (ENV['CI_NAME'] && ENV['CI_NAME'] == 'codeship') {
            return Symbol.for('codeship');
        }
        if (ENV['DRONE'] == 'true') {
            return Symbol.for('drone');
        }
        if (ENV['SEMAPHORE'] == 'true') {
            return Symbol.for('semaphore');
        }
    },

    // @return [Hash] All commit data from the current commit. Might be empty if commit data could
    // not be found.
    get commit() {
        // output = _raw_commit_output(_commit_sha) if _commit_sha
        // output = _raw_commit_output('HEAD') if !output

        // // Use the specified SHA or, if not given, the parsed SHA at HEAD.
        // commit_sha = _commit_sha || output && output.match(/COMMIT_SHA:(.*)/)[1]

        // // If not running in a git repo, allow nils for certain commit attributes.
        // extract_or_nil = lambda { |regex| (output && output.match(regex) || [])[1] }
        // data = {
        //     // The only required attribute:
        //     branch: branch,
        //     // An optional but important attribute:
        //     sha: commit_sha,

        //     // Optional attributes:
        //     message: extract_or_nil.call(/COMMIT_MESSAGE:(.*)/m),
        //     committed_at: extract_or_nil.call(/COMMITTED_DATE:(.*)/),
        //     // These GIT_ environment vars are from the Jenkins Git Plugin, but could be
        //     // used generically. This behavior may change in the future.
        //     author_name: extract_or_nil.call(/AUTHOR_NAME:(.*)/) || ENV['GIT_AUTHOR_NAME'],
        //     author_email: extract_or_nil.call(/AUTHOR_EMAIL:(.*)/)    || ENV['GIT_AUTHOR_EMAIL'],
        //     committer_name: extract_or_nil.call(/COMMITTER_NAME:(.*)/) || ENV['GIT_COMMITTER_NAME'],
        //     committer_email: extract_or_nil.call(/COMMITTER_EMAIL:(.*)/) || ENV['GIT_COMMITTER_EMAIL'],
        // }
        // return data;
    },

    // @private
    get _commit_sha() {
        if (ENV['PERCY_COMMIT']) {
            return ENV['PERCY_COMMIT'];
        }

        // case current_ci
        // when Symbol.for('jenkins')
        //     // Pull Request Builder Plugin OR Git Plugin.
        //     ENV['ghprbActualCommit'] || ENV['GIT_COMMIT']
        // when Symbol.for('travis')
        //     ENV['TRAVIS_COMMIT']
        // when Symbol.for('circle')
        //     ENV['CIRCLE_SHA1']
        // when Symbol.for('codeship')
        //     ENV['CI_COMMIT_ID']
        // when Symbol.for('drone')
        //     ENV['DRONE_COMMIT']
        // when Symbol.for('semaphore')
        //     ENV['REVISION']
        // end
    },

    // @private
    _raw_commit_output: function (commit_sha) {
        // format = GIT_FORMAT_LINES.join('%n')    // `git show` format uses %n for newlines.
        // output = `git show --quiet ${commit_sha} --format=`${format}` 2> /dev/null`.strip
        // return if $?.to_i != 0
        // output
    },

    // The name of the current branch.
    get branch() {
        if (ENV['PERCY_BRANCH']) {
            return ENV['PERCY_BRANCH'];
        }

        // result = case current_ci
        // when Symbol.for('jenkins')
        //     ENV['ghprbTargetBranch']
        // when Symbol.for('travis')
        //     if pull_request_number && ENV['TRAVIS_BRANCH'] == 'master'
        //         `github-pr-${pull_request_number}`
        //     else
        //         ENV['TRAVIS_BRANCH']
        //     end
        // when Symbol.for('circle')
        //     ENV['CIRCLE_BRANCH']
        // when Symbol.for('codeship')
        //     ENV['CI_BRANCH']
        // when Symbol.for('drone')
        //     ENV['DRONE_BRANCH']
        // when Symbol.for('semaphore')
        //     ENV['BRANCH_NAME']
        // else
        //     _raw_branch_output
        // end
        // if result == ''
        //     STDERR.puts '[percy] Warning: not in a git repo, setting PERCY_BRANCH to `master`.'
        //     result = 'master'
        // end
        // result
    },

    // @private
    get _raw_branch_output() {
        // Discover from local git repo branch name.
        // `git rev-parse --abbrev-ref HEAD 2> /dev/null`.strip
    },

    get repo() {
        if (ENV['PERCY_REPO_SLUG']) {
            return ENV['PERCY_REPO_SLUG'];
        }

        var current_ci = this.current_ci;
        if (current_ci === Symbol.for('travis')) {
            return ENV['TRAVIS_REPO_SLUG']
        }
        if (current_ci === Symbol.for('circle')) {
            return `${ENV['CIRCLE_PROJECT_USERNAME']}/${ENV['CIRCLE_PROJECT_REPONAME']}`
        }
        if (current_ci === Symbol.for('semaphore')) {
            return ENV['SEMAPHORE_REPO_SLUG']
        }
        var origin_url = Environment._get_origin_url.trim();
        if (origin_url === '') {
            throw new Environment.RepoNotFoundError(
                'No local git repository found. ' +
                'You can manually set PERCY_REPO_SLUG to fix this.'
            );
        }
        var match = origin_url.match(/[:/]([^/]+\/[^/]+?)(\.git)?$/);
        if (!match) {
            throw new Environment.RepoNotFoundError(
                `Could not determine repository name from URL: ${origin_url}\n` +
                `You can manually set PERCY_REPO_SLUG to fix this.`
            );
        }
        return match[1];
    },

    get pull_request_number() {
        if (ENV['PERCY_PULL_REQUEST']) {
            return ENV['PERCY_PULL_REQUEST'];
        }

        // case current_ci
        // when Symbol.for('jenkins')
        //     // GitHub Pull Request Builder plugin.
        //     ENV['ghprbPullId']
        // when Symbol.for('travis')
        //     ENV['TRAVIS_PULL_REQUEST'] if ENV['TRAVIS_PULL_REQUEST'] != 'false'
        // when Symbol.for('circle')
        //     if ENV['CI_PULL_REQUESTS'] && ENV['CI_PULL_REQUESTS'] != ''
        //         ENV['CI_PULL_REQUESTS'].split('/')[-1]
        //     end
        // when Symbol.for('codeship')
        //     // Unfortunately, codeship always returns 'false' for CI_PULL_REQUEST. For now, return nil.
        // when Symbol.for('drone')
        //     ENV['CI_PULL_REQUEST']
        // when Symbol.for('semaphore')
        //     ENV['PULL_REQUEST_NUMBER']
        // end
    },

    // A nonce which will be the same for all nodes of a parallel build, used to identify shards
    // of the same CI build. This is usually just the CI environment build ID.
    get parallel_nonce() {
        if (ENV['PERCY_PARALLEL_NONCE']) {
            return ENV['PERCY_PARALLEL_NONCE'];
        }

        // case current_ci
        // when Symbol.for('travis')
        //     ENV['TRAVIS_BUILD_NUMBER']
        // when Symbol.for('circle')
        //     ENV['CIRCLE_BUILD_NUM']
        // when Symbol.for('codeship')
        //     ENV['CI_BUILD_NUMBER']
        // when Symbol.for('semaphore')
        //     ENV['SEMAPHORE_BUILD_NUMBER']
        // end
    },

    get parallel_total_shards() {
        if (ENV['PERCY_PARALLEL_TOTAL']) {
            return Number(ENV['PERCY_PARALLEL_TOTAL']);
        }

        // case current_ci
        // when Symbol.for('circle')
        //     var = 'CIRCLE_NODE_TOTAL'
        //     Number(ENV[var]) if ENV[var] && !ENV[var].empty?
        // when Symbol.for('travis')
        //     // Support for https://github.com/ArturT/knapsack
        //     var = 'CI_NODE_TOTAL'
        //     Number(ENV[var]) if ENV[var] && !ENV[var].empty?
        // when Symbol.for('semaphore')
        //     Number(ENV['SEMAPHORE_THREAD_COUNT'])
        // end
    },

    // @private
    get _get_origin_url() {
        return execSync('git config --get remote.origin.url', {
            encoding: 'utf8'
        });
    }
};
