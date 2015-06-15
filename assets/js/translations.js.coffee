walletApp.config [
  "$translateProvider"
  ($translateProvider) ->
    # We need to support the same languages as iOs and Android or provide 
    # fallbacks, or $translate.use will throw an exception.
    $translateProvider.registerAvailableLanguageKeys(["de", "hi", "no", "ru", "pt", "bg", "fr", "zh-cn", "hu", "sl", "id", "sv", "ko", "el", "en", "it", "es", "vi", "th", "ja", "pl", "da", "ro", "nl", "tr"]) 
    
    $translateProvider.useStaticFilesLoader {
        # Grunt will parse the lookup table and replace the file names with easier to cache versions.
        lookup:
          de: "build/locales/de.json"
          hi: "build/locales/hi.json"
          no: "build/locales/no.json"
          ru: "build/locales/ru.json"
          pt: "build/locales/pt.json"
          bg: "build/locales/bg.json"
          fr: "build/locales/fr.json"
          "zh-cn": "build/locales/zh-cn.json"
          hu: "build/locales/hu.json"
          sl: "build/locales/sl.json"
          id: "build/locales/id.json"
          sv: "build/locales/sv.json"
          ko: "build/locales/ko.json"
          el: "build/locales/el.json"
          en: "build/locales/en.json"
          it: "build/locales/it.json"
          es: "build/locales/es.json"
          vi: "build/locales/vi.json"
          th: "build/locales/th.json"
          ja: "build/locales/ja.json"
          pl: "build/locales/pl.json"
          da: "build/locales/da.json"
          ro: "build/locales/ro.json"
          nl: "build/locales/nl.json"                   
          tr: "build/locales/tr.json"
    }

    $translateProvider.determinePreferredLanguage()
    
    $translateProvider.fallbackLanguage('en')
    
    $translateProvider.useSanitizeValueStrategy('escaped');
]