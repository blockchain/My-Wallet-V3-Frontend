# If necessary, the translations can be stored in seperate JSON files and be loaded dynamically:
# http://technpol.wordpress.com/2013/11/02/adding-translation-using-angular-translate-to-an-angularjs-app/

walletApp.config [
  "$translateProvider"
  ($translateProvider) ->
    $translateProvider.registerAvailableLanguageKeys(["en", "nl"]) 
    
    $translateProvider.translations "en",
      UID: "UID"
      PASSWORD: "Password"
      LOGIN: "Login"
      CREATE_WALLET: "Create wallet"
      MY_ACCOUNTS: "My Accounts"
      NEW_ACCOUNT: "+ New"
      ALL_ACCOUNTS: "All Accounts"

    $translateProvider.translations "nl",
      UID: "UID"
      PASSWORD: "Wachtwoord"
      LOGIN: "Inloggen"
      CREATE_WALLET: "Nieuwe wallet"
      MY_ACCOUNTS: "Mijn Accounts"
      NEW_ACCOUNT: "+ Nieuw"
      ALL_ACCOUNTS: "Alle Accounts"      

    $translateProvider.determinePreferredLanguage()
    # $translateProvider.preferredLanguage("en")
    
    $translateProvider.fallbackLanguage('en')
]