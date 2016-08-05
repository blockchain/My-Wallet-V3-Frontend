require 'json'
require 'open-uri'

whitelist = JSON.parse(File.read('dependency-whitelist.json'))

packages   = whitelist["pgp-signed"]
keys = whitelist["pgp-keys"]

for package in packages
  bower = JSON.parse(File.read("bower_components/#{ package }/.bower.json"))
  version = bower["version"]
  puts version
  puts bower["_resolution"]
  `cd build && rm -rf #{ package } && git clone #{ bower["repository"]["url"] } #{ package }`
  command = "git verify-tag #{ bower["_resolution"]["tag"] } 2>&1"
  puts command

  res = `cd build/#{package} && #{ command }`
  puts res

  good_signature_count = res.scan(/Good signature/).length

  if good_signature_count == 0
    puts "No good signature found"
    exit
  end

  if good_signature_count > 1
    puts "#{ good_signature_count } signatures found. Confused, bailing out"
    exit
  end

  key_ids = res.scan(/RSA key ID ([\da-f]{8})/mi).flatten

  if key_ids.length > 1
    puts "#{ key_ids.length } RSA key IDs found. Confused, bailing out"
    exit
  end

  if !keys.include?(key_ids[0])
    puts "#{ key_ids[0] } is not one of #{ keys }"
  end
end
