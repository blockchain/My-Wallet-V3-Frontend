#!/usr/bin/env ruby
require 'json'
require 'open-uri'
require 'net/http'
require 'pp'

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

def get_phrase_keys(context)
  url = generate_context_url('phrases', context)
  res = Net::HTTP.get(url)
  response = JSON.parse(res)
  if response["status"]["code"] != 0
    puts "List contexts failed:"
    puts response["errors"]
    exit(1)
  end

  return response["results"].collect{|result| result["phrase_key"] }
end

def post_phrase(key, english, context)
  url = generate_context_url('phrases', context)
  res = Net::HTTP.post_form(url, source_language: 'english', phrase_key: key, source_text: english)
end

def delete_phrase(context, key)
  uri = generate_context_url("phrase/#{ key }", context)
  http = Net::HTTP.new("www.onehourtranslation.com")
  request = Net::HTTP::Delete.new(uri.request_uri)
  res = http.request(request)
  response = JSON.parse(res.body)
  if response["status"]["code"] != 0
    puts "Delete phrase #{ key } from context #{ context } failed:"
    puts response["msg"]
    exit(1)
  end
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

def move_phrase_to_context(key, old_context, new_context)
  url = generate_context_url("phrase/#{ key }", old_context)
  res = Net::HTTP.post_form(url, context: new_context)
  response = JSON.parse(res.body)
  if response["status"]["code"] != 0
    puts "Moving #{ key } to context #{ new_context } failed:"
    puts response["errors"]
    exit(1)
  end
  puts response["result"]
end

def get_context_tree(parent)
  remote_contexts = list_contexts()

  def process_context(contexts, parent, remote_contexts)
    for context in remote_contexts
      if context["parent"] == parent
        contexts[context["name"]] = process_context({uuid: context["uuid"]}, context["uuid"], remote_contexts)
      end
    end
    return contexts
  end

  for context in remote_contexts
    if context["uuid"] == parent
      parent_name = context["name"]
    end
  end

  res = {}
  res[parent_name] = process_context({uuid: parent}, parent, remote_contexts)

  return res
end

case ARGV[0]
when "format"
  puts "Don't forget to run 'make dist' first..."
  js_files = Dir.entries("dist/js").keep_if{ |entry| entry.start_with?("wallet-") || entry.start_with?("landing-") }
  js1 = File.read("dist/js/" + js_files[0])
  js2 = File.read("dist/js/" + js_files[1])

  for file in human_translation_files
    path = "locales/" + file
    translations = JSON.load(File.read(path))
    File.write(path, JSON.pretty_generate(translations) + "\n")
  end
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

  def process_phrase_or_context(n, key, obj, translations, context_key=nil, context=nil)
    if obj.is_a?(String)
      puts "#{ "  " * n }#{ key }"
      post_phrase(key, obj, context)
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
          process_phrase_or_context(n + 1, sub_key, sub_obj, sub_translations, key, c)
        end
      end
    end
  end

  for key, obj in JSON.parse(File.read('locales/en-human.json'))
    if !EXCEPTIONS.include?(key)
      process_phrase_or_context(0, key, obj, translations, nil, ARGV[1])
    end
  end
when "new_contexts"
  exit 1 if !ARGV[1]

  local_phrases = JSON.parse(File.read('locales/en-human.json'))
  contexts = get_context_tree(ARGV[1])

  def post_new_contexts(contexts, local_phrases)
    throw "local_phrases missing" if !local_phrases
    for key, value in local_phrases
      if !value.is_a?(String) # Context
        if !contexts[key]
          c = create_context(key, contexts[:uuid])
          puts "Context created: #{ c } - #{ key }"
        end
      end
    end
  end

  post_new_contexts(contexts["wallet_web"], local_phrases)

when "list_contexts"
  pp list_contexts()

when "delete"
  exit 1 if !ARGV[1]
  # Run first:
  # orpahaned
  # new_contexts

  # This downloads the most recent phrase list from OneHour and compares it to
  # the local list. It deletes all phrases from OneHour that are no longer
  # used locally. Before deleting it will check if the phrases have moved to a
  # subcontext. This only works if you use the same key.
  local_phrases = JSON.parse(File.read('locales/en-human.json'))

  contexts = get_context_tree(ARGV[1])

  def find_context_for_phrase(phrase_key, contexts, local_phrases)
    throw "local_phrases missing" if !local_phrases
    for key, value in contexts
      if key != :uuid
        if !local_phrases[key] # orphaned context
          next
        else
          # puts "Recurse into context #{ value }"
          res = find_context_for_phrase(phrase_key, value, local_phrases[key])
          if res
            return res
          end
        end
      else
        res = local_phrases[phrase_key]
        if res
          return value # the uuid
        end
      end
    end
    return nil
  end

  # puts find_context_for_phrase("PURCHASE_PENDING_CANT_CANCEL", contexts["wallet_web"], local_phrases)

  def delete_unused_phrases_and_contexts(name, contexts, local_phrases)
    for key, value in contexts
      if key != :uuid
        if !local_phrases[key]
          puts "Delete unused context #{ key }, #{ value["uuid"] }"
          delete_context(value[:uuid])
        else
          delete_unused_phrases_and_contexts(key, value, local_phrases[key])
        end
      else
        puts "Delete unused phrases for context #{ name }, #{ value }"

        for phrase_key in get_phrase_keys(value)
          if !local_phrases[phrase_key]
            if value == ARGV[1] # Consider if it moved to a sub context
              c = find_context_for_phrase(phrase_key, contexts, local_phrases)
              if c && !["Q", "A"].include?(phrase_key)
                puts "Moving #{phrase_key} to #{ c }"
                move_phrase_to_context(phrase_key, value,c)
                next
              end
            end
            puts "Delete #{ phrase_key }"
            delete_phrase(value, phrase_key)
          end
        end
      end
    end
  end

  delete_unused_phrases_and_contexts(contexts.to_a[0][0], contexts["wallet_web"], local_phrases)


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
  puts "  list_contexts"
  puts "  format: rewrite locales files to clean up formatting"
  puts "  orphaned: remove orphaned strings locally"
  puts "  new_contexts: "
  puts "  delete: remove orphaned strings, check for moves to a different context"
  puts "  upload: submit new strings, update modifed strings"
  exit 1
end
