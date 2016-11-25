#!/usr/bin/env ruby
require 'json'
require 'open-uri'

puts "Don't forget to run 'make dist' first..."

case ARGV[0]
when "orphaned"
  js_files = Dir.entries("dist/js").keep_if{ |entry| entry.start_with?("wallet-") || entry.start_with?("landing-") }
  js1 = File.read("dist/js/" + js_files[0])
  js2 = File.read("dist/js/" + js_files[1])

  orphaned = []
  orphanedContexts = []

  for key, string in JSON.parse(File.read('locales/en-human.json'))
    exceptions = [
      "WORD_1", "WORD_2", "WORD_3", "WORD_4", "WORD_5", "WORD_6", "WORD_7", "WORD_8", "WORD_9", "WORD_10", "WORD_11", "WORD_12"
    ]
    if !exceptions.include?(key) && !js1.include?(key) && !js2.include?(key)
      if string.is_a?(String)
        orphaned.push key
      else
        orphanedContexts.push key
      end
    end
  end

  if orphaned.length + orphanedContexts.length == 0
    puts "No orphaned strings found."
    exit 0
  end

  puts "#{ orphaned.length } orphaned stings found:"
  puts orphaned.join(", ")

  puts "#{ orphanedContexts.length } orphaned contexts found:"
  puts orphanedContexts.join(", ")

  human_translation_files = Dir.entries("locales").keep_if{ |entry| entry.include?("-human") }
  puts human_translation_files

  for file in human_translation_files
    path = "locales/" + file
    translations = JSON.load(File.read(path))
    translations.delete_if { |key, value| orphaned.include?(key) || orphanedContexts.include?(key) }
    File.write(path, JSON.pretty_generate(translations) + "\n")
  end

else
  puts "Usage: ./translations.rb [orphaned]"
  puts "  orphaned: remove orphaned strings"
  exit 1
end
