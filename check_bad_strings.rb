#!/usr/bin/env ruby
didMatch = false
fastRegex = /target=\S_blank\S(?! rel=\Snoopener noreferrer).*$/
slowRegex = /.*target=\S_blank\S(?! rel=\Snoopener noreferrer).*$/
Dir.glob(['locales/*.json', 'app/**/*.pug', 'assets/js/**/*.js']) do |path|
  matches = File.read(path).match(fastRegex)
  if matches
    matches = File.read(path).match(slowRegex) # Easier to read
    puts path + " contains target='blank' without rel='noopener noreferrer:"
    puts ""
    puts matches
    puts ""
    didMatch = true
  end
end
exit 1 if didMatch

didMatch = false
regex = /window\.open/
Dir.glob(['assets/js/**/*.js']) do |path|
  matches = File.read(path).match(regex)
  if matches
    if path == "assets/js/app.js" && matches.length <= 1
      break
    end
    puts path + " contains window.open, use $rootScope.safeWindowOpen() instaed"
    puts ""
    didMatch = true
  end
end
exit 1 if didMatch
