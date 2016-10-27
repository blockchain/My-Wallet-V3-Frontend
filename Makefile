all: clean node_modules test pgp dist changelog

node_modules:
	npm install -g grunt-cli coffee-script
	npm install

build: node_modules
	grunt build

test: build
	./node_modules/karma/bin/karma start karma.conf.js --single-run

pgp: node_modules
	ruby ./check_pgp_signatures.rb

# git-changelog uses the most recent tag, which is not what we want after we
# just tagged a release. Use the previous tag instead.
IS_TAGGED_COMMIT:=$(shell git describe --exact-match HEAD > /dev/null && echo 1 || echo 0)
ifeq ($(IS_TAGGED_COMMIT), 1)
	TAG=$(shell git tag --sort=version:refname | tail -n2 | head -1)
	TAG_ARG:=-t $(TAG)
else
  TAG_ARG:=
endif

ifndef VERSION
ifdef TAG_ARG
export VERSION=$(TAG);
else
export VERSION:=vIntermediate
endif
endif

ifndef API_DOMAIN
export API_DOMAIN:=api.blockchain.info
endif

dist: build
	grunt dist --versionFrontend=$(VERSION) --rootDomain=$(BACKEND_DOMAIN) --apiDomain=$(API_DOMAIN) --network=${NETWORK}
	npm shrinkwrap --dev

dist_fixed_domain: build
	grunt dist --versionFrontend=$(VERSION) --rootDomain=blockchain.info --apiDomain=api.blockchain.info --network=${NETWORK}
	npm shrinkwrap --dev

changelog: node_modules
	node_modules/git-changelog/tasks/command.js $(TAG_ARG) -f "Changelog.md" -g "^fix|^feat|^docs|^refactor|^chore|^test|BREAKING" -i "" -a "Blockchain Wallet V3 Frontend" --repo_url "https://github.com/blockchain/My-Wallet-V3-Frontend"

.env:
	echo "DIST=1\nAUTO_RELOAD=0\nPORT=8080\nROOT_URL=https://blockchain.info\nWEBSOCKET_URL=wss://blockchain.info/inv\nAPI_DOMAIN=https://api.blockchain.info" >> .env

server: .env dist_fixed_domain
	npm start

clean:
	rm -rf build dist node_modules bower_components npm-shrinkwrap.json coverage .sass-cache
	npm cache clean
