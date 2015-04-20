walletApp.config [
  "$translateProvider"
  ($translateProvider) ->
    $translateProvider.registerAvailableLanguageKeys(["en", "nl"]) 
    
    $translateProvider.useStaticFilesLoader {
        # Grunt will parse the lookup table and replace the file names with easier to cache versions.
        lookup:
          en: "locales/en.json"
          nl: "locales/nl.json"          
    }

    $translateProvider.determinePreferredLanguage()
    
    $translateProvider.fallbackLanguage('en')
    
    $translateProvider.useSanitizeValueStrategy('escaped');
]