require 'json'
require 'open-uri'

puts "Don't forget to run 'grunt dist' or 'grunt dist_unsafe' first..."

js_file = Dir.entries("dist").keep_if{|entry| entry.include?("application-") && entry.include?(".js") }
js = File.read("dist/" + js_file[0])

orphaned = false
for key, string in JSON.parse(File.read('locales/en-human.json'))
  exceptions = [
    "WORD_1", "WORD_2", "WORD_3", "WORD_4", "WORD_5", "WORD_6", "WORD_7", "WORD_8", "WORD_9", "WORD_10", "WORD_11", "WORD_12"
  ]
  if !exceptions.include?(key) && !js.include?(key)
    if !orphaned
      puts "Orphaned strings found:"
      orphaned = true
    end
    puts key
  end
end
