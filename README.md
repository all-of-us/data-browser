# Data Browser

## Setup for Development

System requirements:

  * [Docker CE](https://www.docker.com/community-edition)
  * [Ruby](https://www.ruby-lang.org/en/downloads/)
  * [Python](https://www.python.org/downloads/) >= 2.7.9
  * [gcloud](https://cloud.google.com/sdk/docs/#install_the_latest_cloud_tools_version_cloudsdk_current_version)

Docker must be installed to build and run code (For Google workstations, see
go/installdocker.). Ruby is required to run our development scripts, which
document common operations and provide a convenient way to perform them.
Python is required by some scripts and the Google Cloud Tools.

After you've installed `gcloud`, login using your `pmi-ops` account:

```shell
gcloud auth login
```

To initialize the project, run the following:

```shell
git clone https://github.com/all-of-us/data-browser
cd data-browser
git submodule update --init --recursive
```

Then set up [git secrets](#git-secrets) and fire up the [development servers](#running-the-dev-servers).

## Development Process

To make changes, do:

```shell
git checkout master
git pull
git checkout -b <USERNAME>/<BRANCH_NAME>
# (make changes and git add / commit them)
git push -u origin <USERNAME>/<BRANCH_NAME>
```

And make a pull request in your browser at
https://github.com/all-of-us/workbench based on your upload.

After responding to changes, merge in GitHub.

### UI

* Direct your editor to write swap files outside the source tree, so Webpack
does not reload when they're updated.
[Example for vim](https://github.com/angular/angular-cli/issues/4593).

## Running the Dev Servers

### Public API: dev AppEngine appserver

After running dev-up, run-local-data-migrations, and
run-local-public-data-migrations, run in the api dir:

```Shell
./project.rb run-public-api
```

This will start up the public API on http://localhost:8083/.

#### You can regenerate classes from swagger with

```Shell
./project.rb swagger-regen
```

## git-secrets

### Setup

Download the git-secrets tool.
If you are on a mac, run:
```Shell
  brew install git-secrets
```
If you are on Linux, run:
```Shell
rm -rf git-secrets
git clone https://github.com/awslabs/git-secrets.git
cd git-secrets
sudo make install && sudo chmod o+rx /usr/local/bin/git-secrets
cd ..
rm -rf git-secrets
```
### Running

git-secrets by default runs every time you make a commit. But if you
want to manually scan:
#### The Repository
```Shell
git secrets --scan
```
#### A File(s)
```Shell
git secrets --scan /path/to/file (/other/path/to/file *)
```
#### A Directory (recursively)
```Shell
git secrets --scan -r /path/to/directory
```
