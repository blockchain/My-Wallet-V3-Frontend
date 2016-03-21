all: clean node_modules test pgp dist

node_modules:
	npm install

build:
	grunt build

test: build
	./node_modules/karma/bin/karma start karma.conf.js --single-run

pgp: node_modules
	ruby ./check_pgp_signatures.rb

dist: build
	grunt dist:$(VERSION):$(BACKEND_DOMAIN):$(WALLET_PATH):$(API_DOMAIN)
	npm shrinkwrap --dev

clean:
	rm -rf build dist node_modules bower_components npm-shrinkwrap.json coverage .sass-cache
	npm cache clean
