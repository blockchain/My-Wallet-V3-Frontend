#!/usr/bin/env ruby
require 'json'
require 'open-uri'
bower = JSON.parse(File.read("bower_components/blockchain-wallet/.bower.json"))
puts bower["version"]
