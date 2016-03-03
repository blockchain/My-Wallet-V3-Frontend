# This script ensures that all Bower dependencies are checked against a whitelist of commits.
# Only non-minified source if checked, so always make sure to minify dependencies yourself.

# Ruby is needed as well as the following gems:
# gem install json mechanize

# Run "bower update" first
# Github API requires authentication because of rate limiting. So run with:
# Run "bower update" first
# GITHUB_USER=username GITHUB_TOKEN=personal_access_token ruby check-dependencies.rb

require 'json'
require 'open-uri'
require 'mechanize'

whitelist = JSON.parse(File.read('dependency-whitelist.json'))

@failed = false

##########
# Common #
##########

def getJSONfromURL(url)
  if ENV['GITHUB_USER'] and ENV['GITHUB_TOKEN']
    http_options = {:http_basic_authentication=>[ENV['GITHUB_USER'], ENV['GITHUB_TOKEN']]}
    json = JSON.load(open(url, http_options))
  else
    json = JSON.load(open(url))
  end
  return json
end

def check_commits!(deps, whitelist, output_deps, type)
  deps.keys.each do |key|

    if whitelist["skip"].include? key
      output_deps.delete(key)
      next
    end

    bower = JSON.parse(File.read("bower_components/#{ key }/.bower.json"))
    tag_name = bower["_resolution"]["tag"]
    commit = nil

    # url = "https://api.github.com/repos/#{ whitelist[key]["repo"] }/releases/tags/#{ tag_name }"
    # Github API doesn't work here, because:
    # * Angular tags can't be found through the Github API
    # * The tag API does not specify a commit

    url = "https://github.com/#{ whitelist[key]["repo"] }/releases/#{ tag_name }"
    agent = Mechanize.new
    page = agent.get(url)
    page.links.each do |link|
      if link.href.include? "commit/"
        commit = link.href.split("/").last
        break
      end
    end

    if commit.nil?
      puts "Could not find (commit for) tag: #{key} #{ tag_name }"
      exit(1)
    end


    if !(whitelist["ignore"].include?(key) || whitelist["pgp-signed"].include?(key))
      if !(whitelist[key]["version"] == tag_name ||
           "v#{ whitelist[key]["version"] }" == tag_name)
        puts whitelist[key]["version"]
        puts tag_name
        puts "#{key} #{  tag_name } not whitelisted!"
        puts "https://github.com/#{ whitelist[key]["repo"] }/compare/#{ whitelist[key]['version'] }...#{ tag_name }"

        exit(1)
      end


      if !whitelist[key]["commits"].include?(commit)
        puts "#{key} #{ tag_name } sha does not match"
        puts "#{ commit } != #{ whitelist[key]["commits"] }"

        exit(1)
      end
    end

    output_deps[key] = whitelist[key]["repo"] + "#" + commit

  end
end

#########
# Bower #
#########

bower = JSON.parse(File.read('bower.json'))
output = bower.dup
output.delete("authors")
output.delete("main")
output.delete("ignore")
output.delete("pgp-signed")
output.delete("pgp-keys")
output.delete("license")
output.delete("keywords")

output["ignoredDependencies"] = ["angular", "angular-translate"]
output["resolutions"]["angular-translate"] = whitelist["angular-translate"]["commits"][0]

deps = bower["dependencies"]

check_commits!(deps, whitelist, output["dependencies"], :bower)

File.write("build/bower.json", JSON.pretty_generate(output))

if @failed
  abort "Please fix the above issues..."
end
