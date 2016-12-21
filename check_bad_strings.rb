#!/usr/bin/env ruby
didMatch = false
fastRegex = /target=\S_blank\S(?! rel=\Snoopener noreferrer).*$/
slowRegex = /.*target=\S_blank\S(?! rel=\Snoopener noreferrer).*$/
Dir.glob(['locales/*.json', 'app/**/*.jade', 'assets/js/**/*.js']) do |path|
  matches = File.read(path).match(fastRegex)
  if matches
    matches = File.read(path).match(slowRegex) # Easier to read
    puts path + "contains target='blank' without rel='noopener noreferrer:"
    puts ""
    puts matches
    puts ""
    didMatch = true
  end
end
exit 1 if didMatch
