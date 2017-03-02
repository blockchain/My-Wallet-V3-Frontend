all: clean node_modules test pgp dist changelog

node_modules:
	npm install -g grunt-cli coffee-script
	npm update

bower_components: node_modules
	node_modules/bower/bin/bower install

build: node_modules bower_components
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

ifndef WEB_SOCKET_URL
export WEB_SOCKET_URL:=wss://ws.blockchain.info/inv
endif

ifndef WALLET_HELPER_URL
export WALLET_HELPER_URL:=http://localhost:8081
endif

helperApp/dist: bower_components
	rm -rf helperApp/dist
	DIST=1 ./node_modules/.bin/webpack --bail

dist: helperApp/dist bower_components
	./check_bad_strings.rb
	grunt build --skipWebpack=1

	grunt dist --versionFrontend=$(VERSION) --rootDomain=$(BACKEND_DOMAIN) --apiDomain=$(API_DOMAIN) --webSocketURL=$(WEB_SOCKET_URL) --walletHelperUrl=$(WALLET_HELPER_URL) --network=${NETWORK}
	cp -r helperApp/dist dist/wallet-helper

dist_fixed_domain: helperApp/dist bower_components build
	grunt dist --versionFrontend=$(VERSION) --rootDomain=blockchain.info --apiDomain=api.blockchain.info --webSocketURL=$(WEB_SOCKET_URL) --walletHelperUrl=$(WALLET_HELPER_URL) --network=${NETWORK}
	cp -r helperApp/dist dist/wallet-helper

changelog: node_modules
	node_modules/git-changelog/tasks/command.js $(TAG_ARG)

.env:
	echo "DIST=1\nAUTO_RELOAD=0\nPORT=8080\nROOT_URL=https://blockchain.info\nWEB_SOCKET_URL=wss://ws.blockchain.info/inv\nAPI_DOMAIN=https://api.blockchain.info" >> .env

server: .env dist_fixed_domain
	npm start

clean:
	rm -rf build dist node_modules bower_components npm-shrinkwrap.json coverage .sass-cache helperApp/build helperApp/dist
	# npm cache clean
