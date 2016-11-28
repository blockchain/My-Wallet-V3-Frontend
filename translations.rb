#!/usr/bin/env ruby
require 'json'
require 'open-uri'
require 'net/http'

EXCEPTIONS = [
  "WORD_1", "WORD_2", "WORD_3", "WORD_4", "WORD_5", "WORD_6", "WORD_7", "WORD_8", "WORD_9", "WORD_10", "WORD_11", "WORD_12"
]

human_translation_files = Dir.entries("locales").keep_if{ |entry| entry.include?("-human") }

languages = human_translation_files.collect{|file_name| file_name.gsub("-human", "").split(".")[0] }
OTHER_LANGUAGES = languages.keep_if{|language| language != 'en'}

API_ROOT="https://www.onehourtranslation.com/api/2/tm/"

def generate_url(path)
  return URI("#{ API_ROOT }#{ path }?public_key=#{ ENV["ONE_HOUR_PUBLIC_KEY"] }&secret_key=#{ ENV["ONE_HOUR_SECRET_KEY"] }")
end

def generate_context_url(endpoint, context)
  if !ENV["ONE_HOUR_PUBLIC_KEY"] || !ENV["ONE_HOUR_SECRET_KEY"]
    throw "API keys missing"
  end
  if !context || !context.start_with?("c-")
    throw "Missing context"
  end
  return generate_url("context/#{ context }/#{ endpoint }")
end

def list_contexts()
  url = generate_url("context")
  res = Net::HTTP.get(url)
  response = JSON.parse(res)
  if response["status"]["code"] != 0
    puts "List contexts failed:"
    puts response["errors"]
    exit(1)
  end

  return response["results"]
end

def delete_context(uuid)
  uri = generate_url("context/#{ uuid }")
  http = Net::HTTP.new("www.onehourtranslation.com")
  request = Net::HTTP::Delete.new(uri.request_uri)
  res = http.request(request)
  response = JSON.parse(res.body)
  if response["status"]["code"] != 0
    puts "Delete context #{ uuid } failed:"
    puts response["msg"]
    exit(1)
  end
end

def create_context(name, parent)
  if !parent || !parent.start_with?("c-")
    throw "Missing parent context"
  end
  url = generate_url("/context")
  res = Net::HTTP.post_form(url, context_name: name, parent_context: parent)
  response = JSON.parse(res.body)
  if response["status"]["code"] != 0
    puts "Create context #{ name } failed:"
    puts response["errors"]
    exit(1)
  end

  return response["results"]["uuid"]
end

def post_word(key, english, context)
  url = generate_context_url('phrases', context)
  res = Net::HTTP.post_form(url, source_language: 'english', phrase_key: key, source_text: english)
end

def post_translation(key, language, translation, context)
  if language == "zh-cn"
    language = "zh-cn-cmn-s"
  end
  url = generate_context_url("phrase/#{ key }", context)
  res = Net::HTTP.post_form(url, target_language: language, target_text: translation)
  response = JSON.parse(res.body)
  if response["status"]["code"] != 0
    puts "Post #{ language } translation #{ key } failed:"
    puts response["errors"]
    exit(1)
  end
end

case ARGV[0]
when "orphaned"
  puts "Don't forget to run 'make dist' first..."
  js_files = Dir.entries("dist/js").keep_if{ |entry| entry.start_with?("wallet-") || entry.start_with?("landing-") }
  js1 = File.read("dist/js/" + js_files[0])
  js2 = File.read("dist/js/" + js_files[1])

  orphaned = []
  orphanedContexts = []

  for key, string in JSON.parse(File.read('locales/en-human.json'))
    if !EXCEPTIONS.include?(key) && !js1.include?(key) && !js2.include?(key)
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

  for file in human_translation_files
    path = "locales/" + file
    translations = JSON.load(File.read(path))
    translations.delete_if { |key, value| orphaned.include?(key) || orphanedContexts.include?(key) }
    File.write(path, JSON.pretty_generate(translations) + "\n")
  end
when "upload"
  # Load translation files:
  translations = {}
  for language in OTHER_LANGUAGES
    path = "locales/#{ language }-human.json"
    translations[language] = JSON.load(File.read(path))
  end

  def process_word_or_context(n, key, obj, translations, context_key=nil, context=nil)
    if obj.is_a?(String)
      puts "#{ "  " * n }#{ key }"
      post_word(key, obj, context)
      for language in OTHER_LANGUAGES
        translation = translations[language][key]
        if !translation.nil?
          post_translation(key, language, translation, context)
        else
          puts "#{ "  " * n } No #{ language } translation for #{ key }."
        end
      end
    else
      c = create_context(key, context)
      puts "#{ "  " * n }Context created: #{ c } - #{ key }"

      sub_translations = {}
      for language in OTHER_LANGUAGES
        sub_translations[language] = translations[language][key]
      end

      for sub_key, sub_obj in obj
        if !EXCEPTIONS.include?(sub_key)
          process_word_or_context(n + 1, sub_key, sub_obj, sub_translations, key, c)
        end
      end
    end
  end

  for key, obj in JSON.parse(File.read('locales/en-human.json'))
    if !EXCEPTIONS.include?(key)
      process_word_or_context(0, key, obj, translations, nil, ARGV[1])
    end
  end
when "cleanup"
  # This deletes all context except wallet_web. Don't use this.
  # for context in list_contexts().reverse
  #   if context["name"] != "wallet_web"
  #     puts "Delete: #{ context["name"] }"
  #     delete_context(context["uuid"])
  #   end
  # end
else
  puts "Usage: ./translations.rb [orphaned|upload]"
  puts "  orphaned: remove orphaned strings"
  puts "  upload: submit new strings, update modifed strings"
  exit 1
end
