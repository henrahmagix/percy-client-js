var Percy = require.main.require('./lib/percy');
var ENV = process.env;
describe('Percy.Client.Environment', function () {
    var clear_env_vars = function () {
        // Unset Percy vars.
        delete ENV['PERCY_COMMIT'];
        delete ENV['PERCY_BRANCH'];
        delete ENV['PERCY_PULL_REQUEST'];
        delete ENV['PERCY_REPO_SLUG'];
        delete ENV['PERCY_PARALLEL_NONCE'];
        delete ENV['PERCY_PARALLEL_TOTAL'];

        // Unset Travis vars.
        delete ENV['TRAVIS_BUILD_ID'];
        delete ENV['TRAVIS_BUILD_NUMBER'];
        delete ENV['TRAVIS_COMMIT'];
        delete ENV['TRAVIS_BRANCH'];
        delete ENV['TRAVIS_PULL_REQUEST'];
        delete ENV['TRAVIS_REPO_SLUG'];
        delete ENV['CI_NODE_TOTAL'];

        // Unset Jenkins vars.
        delete ENV['JENKINS_URL'];
        delete ENV['ghprbPullId'];
        delete ENV['ghprbActualCommit'];
        delete ENV['ghprbTargetBranch'];

        // Unset Circle CI vars.
        delete ENV['CIRCLECI'];
        delete ENV['CIRCLE_SHA1'];
        delete ENV['CIRCLE_BRANCH'];
        delete ENV['CIRCLE_PROJECT_USERNAME'];
        delete ENV['CIRCLE_PROJECT_REPONAME'];
        delete ENV['CIRCLE_BUILD_NUM'];
        delete ENV['CI_PULL_REQUESTS'];

        // Unset Codeship vars.
        delete ENV['CI_NAME'];
        delete ENV['CI_BRANCH'];
        delete ENV['CI_PULL_REQUEST'];
        delete ENV['CI_COMMIT_ID'];
        delete ENV['CI_BUILD_NUMBER'];

        // Unset Drone vars.
        delete ENV['CI'];
        delete ENV['DRONE'];
        delete ENV['DRONE_COMMIT'];
        delete ENV['DRONE_BRANCH'];
        delete ENV['CI_PULL_REQUEST'];

        // Unset Semaphore CI vars.
        delete ENV['CI'];
        delete ENV['SEMAPHORE'];
        delete ENV['REVISION'];
        delete ENV['BRANCH_NAME'];
        delete ENV['SEMAPHORE_REPO_SLUG'];
        delete ENV['SEMAPHORE_BUILD_NUMBER'];
        delete ENV['SEMAPHORE_CURRENT_THREAD'];
        delete ENV['PULL_REQUEST_NUMBER'];
    };

    beforeEach(function () {
        this.original_env = {
            TRAVIS_BUILD_ID: ENV['TRAVIS_BUILD_ID'],
            TRAVIS_BUILD_NUMBER: ENV['TRAVIS_BUILD_NUMBER'],
            TRAVIS_COMMIT: ENV['TRAVIS_COMMIT'],
            TRAVIS_BRANCH: ENV['TRAVIS_BRANCH'],
            TRAVIS_PULL_REQUEST: ENV['TRAVIS_PULL_REQUEST'],
            TRAVIS_REPO_SLUG: ENV['TRAVIS_REPO_SLUG']
        };
        clear_env_vars();
    });
    afterEach(function () {
        clear_env_vars();
        if (this.original_env['TRAVIS_BUILD_ID'] !== undefined) {
            ENV['TRAVIS_BUILD_ID'] = this.original_env['TRAVIS_BUILD_ID'];
        }
        if (this.original_env['TRAVIS_BUILD_NUMBER'] !== undefined) {
            ENV['TRAVIS_BUILD_NUMBER'] = this.original_env['TRAVIS_BUILD_NUMBER'];
        }
        if (this.original_env['TRAVIS_COMMIT'] !== undefined) {
            ENV['TRAVIS_COMMIT'] = this.original_env['TRAVIS_COMMIT'];
        }
        if (this.original_env['TRAVIS_BRANCH'] !== undefined) {
            ENV['TRAVIS_BRANCH'] = this.original_env['TRAVIS_BRANCH'];
        }
        if (this.original_env['TRAVIS_PULL_REQUEST'] !== undefined) {
            ENV['TRAVIS_PULL_REQUEST'] = this.original_env['TRAVIS_PULL_REQUEST'];
        }
        if (this.original_env['TRAVIS_REPO_SLUG'] !== undefined) {
            ENV['TRAVIS_REPO_SLUG'] = this.original_env['TRAVIS_REPO_SLUG'];
        }
    });

    describe('no known CI environment', function () {
        describe('#current_ci', function () {
            it('is undefined', function () {
                expect(Percy.Client.Environment.current_ci).toBeUndefined();
            });
        });
        describe('#branch', function () {
            it('returns master if not in a git repo', function () {
                spyOnProperty(Percy.Client.Environment, '_raw_branch_output', 'get').and.returnValue('');
                expect(Percy.Client.Environment.branch).toBe('master');
            });
            it('reads from the current local repo', function () {
                expect(Percy.Client.Environment.branch).not.toBe('');
            });
            it('can be overridden with PERCY_BRANCH', function () {
                ENV['PERCY_BRANCH'] = 'test-branch';
                expect(Percy.Client.Environment.branch).toBe('test-branch');
            });
        });
        describe('#_commit_sha', function () {
            it('returns undefined if no environment info can be found', function () {
                expect(Percy.Client.Environment._commit_sha).toBeUndefined();
            });
            it('can be overridden with PERCY_COMMIT', function () {
                ENV['PERCY_COMMIT'] = 'test-commit';
                expect(Percy.Client.Environment._commit_sha).toBe('test-commit');
            });
        });
        describe('#pull_request_number', function () {
            it('returns undefined if no CI environment', function () {
                expect(Percy.Client.Environment.pull_request_number).toBeUndefined();
            });
            it('can be overridden with PERCY_PULL_REQUEST', function () {
                ENV['PERCY_PULL_REQUEST'] = '123';
                ENV['TRAVIS_BUILD_ID'] = '1234';
                ENV['TRAVIS_PULL_REQUEST'] = '256';
                expect(Percy.Client.Environment.pull_request_number).toBe('123');
            });
        });
        describe('#repo', function () {
            it('returns the current local repo name', function () {
                expect(Percy.Client.Environment.repo).toBe('henrahmagix/percy-client-js');
            });
            it('can be overridden with PERCY_REPO_SLUG', function () {
                ENV['PERCY_REPO_SLUG'] = 'percy/slug';
                expect(Percy.Client.Environment.repo).toBe('percy/slug');
            });
            it('handles git ssh urls', function () {
                spyOnProperty(Percy.Client.Environment, '_get_origin_url', 'get');
                var spy = Object.getOwnPropertyDescriptor(Percy.Client.Environment, '_get_origin_url').get;

                spy.and.returnValue('git@github.com:org-name/repo-name.git');
                expect(spy.calls.count()).toBe(0);
                expect(Percy.Client.Environment.repo).toBe('org-name/repo-name');
                expect(spy.calls.count()).toBe(1);

                spy.and.returnValue('git@github.com:org-name/repo-name.org.git');
                expect(Percy.Client.Environment.repo).toBe('org-name/repo-name.org');
                expect(spy.calls.count()).toBe(2);

                spy.and.returnValue('git@custom-local-hostname:org-name/repo-name.org');
                expect(Percy.Client.Environment.repo).toBe('org-name/repo-name.org');
                expect(spy.calls.count()).toBe(3);
            });
            it('handles git https urls', function () {
                spyOnProperty(Percy.Client.Environment, '_get_origin_url', 'get');
                var spy = Object.getOwnPropertyDescriptor(Percy.Client.Environment, '_get_origin_url').get;

                spy.and.returnValue('https://github.com/org-name/repo-name.git');
                expect(spy.calls.count()).toBe(0);
                expect(Percy.Client.Environment.repo).toBe('org-name/repo-name');
                expect(spy.calls.count()).toBe(1);

                spy.and.returnValue('https://github.com/org-name/repo-name.org.git');
                expect(Percy.Client.Environment.repo).toBe('org-name/repo-name.org');
                expect(spy.calls.count()).toBe(2);

                spy.and.returnValue("https://github.com/org-name/repo-name.org\n");
                expect(Percy.Client.Environment.repo).toBe('org-name/repo-name.org');
                expect(spy.calls.count()).toBe(3);
            });
            it('errors if unable to parse local repo name', function () {
                spyOnProperty(Percy.Client.Environment, '_get_origin_url', 'get');
                var spy = Object.getOwnPropertyDescriptor(Percy.Client.Environment, '_get_origin_url').get;

                spy.and.returnValue('foo');
                expect(spy.calls.count()).toBe(0);
                expect(() => Percy.Client.Environment.repo).toThrowError(
                    Percy.Client.Environment.RepoNotFoundError);
                expect(spy.calls.count()).toBe(1);
            });
        });
        describe('#parallel_nonce', function () {
            it('returns undefined', function () {
                expect(Percy.Client.Environment.parallel_nonce).toBeUndefined();
            });
            it('can be set with environment var', function () {
                ENV['PERCY_PARALLEL_NONCE'] = 'nonce';
                expect(Percy.Client.Environment.parallel_nonce).toBe('nonce');
            });
        });
        describe('#parallel_total_shards', function () {
            it('returns undefined', function () {
                expect(Percy.Client.Environment.parallel_nonce).toBeUndefined();
            });
            it('can be set with environment var', function () {
                ENV['PERCY_PARALLEL_TOTAL'] = '3';
                expect(Percy.Client.Environment.parallel_total_shards).toBe(3);
            });
        });
    });
    describe('in Jenkins CI', function () {
        beforeEach(function () {
            ENV['JENKINS_URL'] = 'http://localhost:8080/';
            ENV['ghprbPullId'] = '123';
            ENV['ghprbTargetBranch'] = 'jenkins-target-branch';
            ENV['ghprbActualCommit'] = 'jenkins-actual-commit';
        });

        describe('#current_ci', function () {
            it('is :jenkins', function () {
                expect(Percy.Client.Environment.current_ci).toBe(Symbol.for('jenkins'));
            });
        });
        describe('#branch', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.branch).toBe('jenkins-target-branch');
            });
        });
        describe('#_commit_sha', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment._commit_sha).toBe('jenkins-actual-commit');
            });
        });
        describe('#pull_request_number', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.pull_request_number).toBe('123');
            });
        });
        describe('#repo', function () {
            it('returns the current local repo name', function () {
                expect(Percy.Client.Environment.repo).toBe('henrahmagix/percy-client-js');
            });
        });
    });
    describe('in Travis CI', function () {
        beforeEach(function () {
            ENV['TRAVIS_BUILD_ID'] = '1234';
            ENV['TRAVIS_BUILD_NUMBER'] = 'build-number';
            ENV['TRAVIS_PULL_REQUEST'] = '256';
            ENV['TRAVIS_REPO_SLUG'] = 'travis/repo-slug';
            ENV['TRAVIS_COMMIT'] = 'travis-commit-sha';
            ENV['TRAVIS_BRANCH'] = 'travis-branch';
            ENV['CI_NODE_TOTAL'] = '3';
        });

        describe('#current_ci', function () {
            it('is :travis', function () {
                expect(Percy.Client.Environment.current_ci).toBe(Symbol.for('travis'));
            });
        });
        describe('#branch', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.branch).toBe('travis-branch');
            });
            it('renames the Percy branch if this is a PR with an unknown head branch', function () {
                // Note: this is very unfortunately necessary because Travis does not expose the head branch,
                // only the targeted branch in TRAVIS_BRANCH and no way to get the actual head PR branch.
                // We create a fake branch name so that Percy does not mistake this PR as a new master build.
                // https://github.com/travis-ci/travis-ci/issues/1633#issuecomment-194749671
                ENV['TRAVIS_BRANCH'] = 'master';
                expect(Percy.Client.Environment.branch).toBe('github-pr-256');
            });
        });
        describe('#_commit_sha', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment._commit_sha).toBe('travis-commit-sha');
            });
        });
        describe('#pull_request_number', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.pull_request_number).toBe('256');
            });
        });
        describe('#repo', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.repo).toBe('travis/repo-slug');
            });
        });
        describe('#parallel_nonce', function () {
            it('reads from the CI environment (the CI build number)', function () {
                expect(Percy.Client.Environment.parallel_nonce).toBe('build-number');
            });
        });
        describe('#parallel_total_shards', function () {
            it('reads from the CI environment (the number of nodes)', function () {
                expect(Percy.Client.Environment.parallel_total_shards).toBe(3);
            });
            it('is undefined if empty', function () {
                ENV['CI_NODE_TOTAL'] = '';
                expect(Percy.Client.Environment.parallel_total_shards).toBeUndefined();
            });
        });
    });
    describe('in Circle CI', function () {
        beforeEach(function () {
            ENV['CIRCLECI'] = 'true';
            ENV['CIRCLE_BRANCH'] = 'circle-branch';
            ENV['CIRCLE_SHA1'] = 'circle-commit-sha';
            ENV['CIRCLE_PROJECT_USERNAME'] = 'circle';
            ENV['CIRCLE_PROJECT_REPONAME'] = 'repo-name';
            ENV['CIRCLE_BUILD_NUM'] = 'build-number';
            ENV['CIRCLE_NODE_TOTAL'] = '2';
            ENV['CI_PULL_REQUESTS'] = 'https://github.com/owner/repo-name/pull/123';
        });

        describe('#current_ci', function () {
            it('is :circle', function () {
                expect(Percy.Client.Environment.current_ci).toBe(Symbol.for('circle'));
            });
        });
        describe('#branch', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.branch).toBe('circle-branch');
            });
        });
        describe('#_commit_sha', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment._commit_sha).toBe('circle-commit-sha');
            });
        });

        describe('#pull_request_number', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.pull_request_number).toBe('123');
            });
        });
        describe('#repo', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.repo).toBe('circle/repo-name');
            });
        });
        describe('#parallel_nonce', function () {
            it('reads from the CI environment (the CI build number)', function () {
                expect(Percy.Client.Environment.parallel_nonce).toBe('build-number');
            });
        });
        describe('#parallel_total_shards', function () {
            it('reads from the CI environment (the number of nodes)', function () {
                expect(Percy.Client.Environment.parallel_total_shards).toBe(2);
            });
            it('is undefined if empty', function () {
                ENV['CIRCLE_NODE_TOTAL'] = '';
                expect(Percy.Client.Environment.parallel_total_shards).toBeUndefined();
            });
        });
    });
    describe('in Codeship', function () {
        beforeEach(function () {
            ENV['CI_NAME'] = 'codeship';
            ENV['CI_BRANCH'] = 'codeship-branch';
            ENV['CI_BUILD_NUMBER'] = 'codeship-build-number';
            ENV['CI_PULL_REQUEST'] = 'false';    // This is always false on Codeship, unfortunately.
            ENV['CI_COMMIT_ID'] = 'codeship-commit-sha';
        });

        describe('#current_ci', function () {
            it('is :codeship', function () {
                expect(Percy.Client.Environment.current_ci).toBe(Symbol.for('codeship'));
            });
        });
        describe('#branch', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.branch).toBe('codeship-branch');
            });
        });
        describe('#_commit_sha', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment._commit_sha).toBe('codeship-commit-sha');
            });
        });
        describe('#pull_request_number', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.pull_request_number).toBeUndefined();
            });
        });
        describe('#repo', function () {
            it('returns the current local repo name', function () {
                expect(Percy.Client.Environment.repo).toBe('henrahmagix/percy-client-js');
            });
        });
        describe('#parallel_nonce', function () {
            it('reads from the CI environment (the CI build number)', function () {
                expect(Percy.Client.Environment.parallel_nonce).toBe('codeship-build-number');
            });
        });
    });
    describe('in Drone', function () {
        beforeEach(function () {
            ENV['DRONE'] = 'true';
            ENV['DRONE_COMMIT'] = 'drone-commit-sha';
            ENV['DRONE_BRANCH'] = 'drone-branch';
            ENV['CI_PULL_REQUEST'] = '123';
        });

        describe('#current_ci', function () {
            it('is :drone', function () {
                expect(Percy.Client.Environment.current_ci).toBe(Symbol.for('drone'));
            });
        });
        describe('#branch', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.branch).toBe('drone-branch');
            });
        });
        describe('#_commit_sha', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment._commit_sha).toBe('drone-commit-sha');
            });
        });
        describe('#pull_request_number', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.pull_request_number).toBe('123');
            });
        });
        describe('#repo', function () {
            it('returns the current local repo name', function () {
                expect(Percy.Client.Environment.repo).toBe('henrahmagix/percy-client-js');
            });
        });
    });
    describe('in Semaphore CI', function () {
        beforeEach(function () {
            ENV['SEMAPHORE'] = 'true';
            ENV['BRANCH_NAME'] = 'semaphore-branch';
            ENV['REVISION'] = 'semaphore-commit-sha';
            ENV['SEMAPHORE_REPO_SLUG'] = 'repo-owner/repo-name';
            ENV['SEMAPHORE_BUILD_NUMBER'] = 'semaphore-build-number';
            ENV['SEMAPHORE_THREAD_COUNT'] = '2';
            ENV['PULL_REQUEST_NUMBER'] = '123';
        });

        describe('#current_ci', function () {
            it('is :semaphore', function () {
                expect(Percy.Client.Environment.current_ci).toBe(Symbol.for('semaphore'));
            });
        });
        describe('#branch', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.branch).toBe('semaphore-branch');
            });
        });
        describe('#_commit_sha', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment._commit_sha).toBe('semaphore-commit-sha');
            });
        });

        describe('#pull_request_number', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.pull_request_number).toBe('123');
            });
        });
        describe('#repo', function () {
            it('reads from the CI environment', function () {
                expect(Percy.Client.Environment.repo).toBe('repo-owner/repo-name');
            });
        });
        describe('#parallel_nonce', function () {
            it('reads from the CI environment (the CI build number)', function () {
                expect(Percy.Client.Environment.parallel_nonce).toBe('semaphore-build-number');
            });
        });
        describe('#parallel_total_shards', function () {
            it('reads from the CI environment (the number of nodes)', function () {
                expect(Percy.Client.Environment.parallel_total_shards).toBe(2);
            });
        });
    });
    describe('local git repo methods', function () {
        describe('#commit', function () {
            it('returns current local commit data', function () {
                var commit = Percy.Client.Environment.commit;
                expect(commit.branch).not.toBe('');
                expect(commit.sha).not.toBe('');
                expect(commit.sha.length).toBe(40);

                expect(commit.author_email).toMatch(/.+@.+\..+/);
                expect(commit.author_name).not.toBe('');
                expect(commit.committed_at).not.toBe('');
                expect(commit.committer_email).not.toBe('');
                expect(commit.committer_name).not.toBe('');
                expect(commit.message).not.toBe('');
            });
            it('returns only branch if commit data cannot be found', function () {
                spyOn(Percy.Client.Environment, '_raw_commit_output')
                    .and.returnValue(undefined);
                expect(Percy.Client.Environment._raw_commit_output.calls.count()).toBe(0);

                var commit = Percy.Client.Environment.commit;
                expect(Percy.Client.Environment._raw_commit_output.calls.count()).toBe(1);
                expect(commit.branch).toBeDefined();
                expect(commit.sha).toBeUndefined();

                expect(commit.author_email).toBeUndefined();
                expect(commit.author_name).toBeUndefined();
                expect(commit.committed_at).toBeUndefined();
                expect(commit.committer_email).toBeUndefined();
                expect(commit.committer_name).toBeUndefined();
                expect(commit.message).toBeUndefined();
            });
        });
    });
});
