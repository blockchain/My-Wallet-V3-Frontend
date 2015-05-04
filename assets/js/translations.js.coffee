walletApp.config [
  "$translateProvider"
  ($translateProvider) ->
    # We need to support the same languages as iOs and Android or provide 
    # fallbacks, or $translate.use will throw an exception.
    $translateProvider.registerAvailableLanguageKeys(["de", "hi", "no", "ru", "pt", "bg", "fr", "zh-cn", "hu", "sl", "id", "sv", "ko", "el", "en", "it", "es", "vi", "th", "ja", "pl", "da", "ro", "nl", "tr"]) 
    
    $translateProvider.useStaticFilesLoader {
        # Grunt will parse the lookup table and replace the file names with easier to cache versions.
        lookup:
          de: "locales/de.json"
          hi: "locales/hi.json"
          no: "locales/no.json"
          ru: "locales/ru.json"
          pt: "locales/pt.json"
          bg: "locales/bg.json"
          fr: "locales/fr.json"
          "zh-cn": "locales/zh-cn.json"
          hu: "locales/hu.json"
          sl: "locales/sl.json"
          id: "locales/id.json"
          sv: "locales/sv.json"
          ko: "locales/ko.json"
          el: "locales/el.json"
          en: "locales/en.json"
          it: "locales/it.json"
          es: "locales/es.json"
          vi: "locales/vi.json"
          th: "locales/th.json"
          ja: "locales/ja.json"
          pl: "locales/pl.json"
          da: "locales/da.json"
          ro: "locales/ro.json"
          nl: "locales/nl.json"                   
          tr: "locales/tr.json"
    }

    $translateProvider.determinePreferredLanguage()
    
    $translateProvider.fallbackLanguage('en')
    
    $translateProvider.useSanitizeValueStrategy('escaped');
]