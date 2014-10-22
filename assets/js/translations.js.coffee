# If necessary, the translations can be stored in seperate JSON files and be loaded dynamically:
# http://technpol.wordpress.com/2013/11/02/adding-translation-using-angular-translate-to-an-angularjs-app/

walletApp.config [
  "$translateProvider"
  ($translateProvider) ->
    $translateProvider.registerAvailableLanguageKeys(["en", "nl", "ar"]) 
    
    $translateProvider.useStaticFilesLoader {
        prefix: 'locale-',
        suffix: '.json'
    }

    $translateProvider.determinePreferredLanguage()
    # $translateProvider.preferredLanguage("en")
    
    $translateProvider.fallbackLanguage('en')
    
    $translateProvider.useSanitizeValueStrategy('escaped');
]