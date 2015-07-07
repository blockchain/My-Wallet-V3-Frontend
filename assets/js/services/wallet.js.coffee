"use strict"

##################
# MyWallet hacks #
##################

# Avoid lazy loading (complicates asset management)
loadScript = (src, success, error) ->
  success()

# Don't allow it to play sound:
playSound = (id) ->
  return

##################################
# Wallet service                 #
#                                #
# AngularJS wrapper for MyWallet #
##################################

walletServices = angular.module("walletServices", [])
walletServices.factory "Wallet", ($log, $http, $window, $timeout, MyWallet, MyBlockchainApi, MyBlockchainSettings, MyWalletStore, MyWalletSpender, $rootScope, ngAudio, $cookieStore, $translate, $filter, $state, $q) ->
  wallet = {
    goal: {auth: false},
    status: {isLoggedIn: false, didUpgradeToHd: null, didInitializeHD: false, didLoadTransactions: false, didLoadBalances: false, legacyAddressBalancesLoaded: false, didConfirmRecoveryPhrase: false},
    settings: {currency: null,  displayCurrency: null, language: null, btcCurrency: null, needs2FA: null, twoFactorMethod: null, feePolicy: null, handleBitcoinLinks: false, blockTOR: null, rememberTwoFactor: null, secondPassword: null, ipWhitelist: null, apiAccess: null, restrictToWhitelist: null},
    user: {current_ip: null, email: null, mobile: null, passwordHint: ""}
  }

  wallet.fiatHistoricalConversionCache = {}

  wallet.conversions = {}

  wallet.accounts     = []
  wallet.legacyAddresses = []
  # wallet.addressBook  = {}
  wallet.paymentRequests = []
  wallet.alerts = []
  wallet.my = MyWallet
  wallet.settings_api = MyBlockchainSettings
  wallet.store = MyWalletStore
  wallet.spender = MyWalletSpender
  wallet.api = MyBlockchainApi
  wallet.transactions = []
  wallet.languages = []
  wallet.currencies = []
  wallet.btcCurrencies = [{ serverCode: 'BTC', code: 'BTC', conversion: 100000000 }, { serverCode: 'MBC', code: 'mBTC', conversion: 100000 }, { serverCode: 'UBC', code: 'bits', conversion: 100 }]
  wallet.hdAddresses = []
  wallet.api_code = '1770d5d9-bcea-4d28-ad21-6cbd5be018a8'

  wallet.store.setAPICode(wallet.api_code)

  ##################################
  #             Public             #
  ##################################

  wallet.login = (uid, password, two_factor_code, needsTwoFactorCallback, successCallback, errorCallback) ->
    didLogin = () ->
      wallet.status.isLoggedIn = true
      wallet.status.didUpgradeToHd = wallet.my.wallet.isUpgradedToHD
      wallet.status.didConfirmRecoveryPhrase = wallet.my.wallet.isMnemonicVerified

      wallet.uid = uid

      # I (jaume) should use address book directly from the wallet object, not copy it
      # for address, label of wallet.store.getAddressBook()
      #   wallet.addressBook[address] = label

      # if wallet.my.wallet.isUpgradedToHD
      #   # probably not need if hdwallet_is_set
      #   wallet.updateAccounts()

      wallet.settings.secondPassword = wallet.store.isDoubleEncrypted
      # todo: jaume: implement pbkdf2 iterations out of walletstore in mywallet
      wallet.settings.pbkdf2 = wallet.store.getPbkdf2Iterations()
      # todo: jaume: implement logout time in mywallet
      wallet.settings.logoutTimeMinutes = wallet.store.getLogoutTime() / 60000

      if wallet.my.wallet.isUpgradedToHD and not wallet.status.didInitializeHD
        wallet.status.didInitializeHD = true
        for account in wallet.my.wallet.hdwallet.accounts
          wallet.accounts.push(account)

      for key in wallet.my.wallet.keys
        wallet.legacyAddresses.push key

        # wallet.updateHDaddresses()

      # Get email address, etc
      # console.log "Getting info..."
      wallet.settings_api.get_account_info((result)->
        # console.log result
        $window.name = "blockchain-"  + result.guid
        wallet.settings.ipWhitelist = result.ip_lock || ""
        wallet.settings.restrictToWhitelist = result.ip_lock_on
        wallet.settings.apiAccess = result.is_api_access_enabled
        wallet.settings.rememberTwoFactor = !result.never_save_auth_type
        wallet.settings.needs2FA = result.auth_type != 0
        wallet.settings.twoFactorMethod = result.auth_type
        wallet.user.email = result.email
        wallet.user.current_ip = result.my_ip
        wallet.status.currentCountryDialCode = result.dial_code
        wallet.status.currentCountryCode = result.country_code
        if result.sms_number
           wallet.user.mobile = {country: result.sms_number.split(" ")[0], number: result.sms_number.split(" ")[1]}
        else # Field is not present if not entered
          wallet.user.mobile = {country: "+1", number: ""}

        wallet.user.isEmailVerified = result.email_verified
        wallet.user.isMobileVerified = result.sms_verified
        wallet.user.passwordHint = result.password_hint1 # Field not present if not entered

        wallet.setLanguage($filter("getByProperty")("code", result.language, wallet.languages))

        # Get currencies:

        wallet.settings.currency = ($filter("getByProperty")("code", result.currency, wallet.currencies))

        wallet.settings.btcCurrency = ($filter("getByProperty")("serverCode", result.btc_currency, wallet.btcCurrencies))

        wallet.settings.displayCurrency = wallet.settings.btcCurrency

        wallet.settings.feePolicy = wallet.store.getFeePolicy()

        wallet.settings.blockTOR = !!result.block_tor_ips

        # Fetch transactions:
        if wallet.my.wallet.isUpgradedToHD
          wallet.my.getHistoryAndParseMultiAddressJSON()

        wallet.applyIfNeeded()
      )

      if successCallback?
        successCallback()

      wallet.applyIfNeeded()

    needsTwoFactorCode = (method) ->
      wallet.displayWarning("Please enter your 2FA code")
      wallet.settings.needs2FA = true
      # 2: Email
      # 3: Yubikey
      # 4: Google Authenticator
      # 5: SMS

      needsTwoFactorCallback()

      wallet.settings.twoFactorMethod = method
      wallet.applyIfNeeded()

    wrongTwoFactorCode = (message) ->
      errorCallback("twoFactor", message)
      wallet.applyIfNeeded()

    loginError = (error) ->
      console.log(error)
      if error.indexOf("Unknown Wallet Identifier") > -1 # Brittle, for lack of a more useful server response
        errorCallback("uid", error)
      else if error.indexOf("password") > -1 # Brittle
         errorCallback("password", error)
      else
        wallet.displayError(error, true)
        errorCallback()

      wallet.applyIfNeeded()

    if two_factor_code? && two_factor_code != ""
      wallet.settings.needs2FA = true
    else
      two_factor_code = undefined

    authorizationProvided = () ->
      wallet.clearAlerts()
      wallet.goal.auth = true
      wallet.applyIfNeeded()

    authorizationRequired = (callback) ->
      callback(authorizationProvided)
      wallet.displayWarning("Please check your email to approve this login attempt.", true)
      wallet.applyIfNeeded()

    betaCheckFinished = () ->
      $window.root = "https://blockchain.info/"
      wallet.my.login(
        uid,
        password,
        two_factor_code,
        didLogin,
        needsTwoFactorCode,
        wrongTwoFactorCode,
        authorizationRequired,
        loginError,  # other_error
        () -> return,     # fetch_success
        () -> return,     # decrypt_success
        () -> return      # build_hd_success
      )

      wallet.fetchExchangeRate()
      return

    # If BETA=1 is set in .env then in index.html/jade $rootScope.beta is set.
    # The following checks are not ideal as they can be bypassed with some creative Javascript commands.
    if $rootScope.beta
      # Check if there is an invite code associated with
      $http.post("/check_guid_for_beta_key", {guid: uid}
      ).success((data) ->
        if(data.verified)
          betaCheckFinished()
        else
          if(data.error && data.error.message)
            wallet.displayError(data.error.message)
          errorCallback()
      ).error () ->
        wallet.displayError("Unable to verify your wallet UID.")
        errorCallback()

    else
      betaCheckFinished()

  wallet.resendTwoFactorSms = (uid, successCallback, errorCallback) ->
    success = () ->
      $translate("RESENT_2FA_SMS").then (translation) ->
        wallet.displaySuccess(translation)

      successCallback()
      wallet.applyIfNeeded()

    error = (e) ->
      $translate("RESENT_2FA_SMS_FAILED").then (translation) ->
        wallet.displayError(translation)
      errorCallback()
      wallet.applyIfNeeded()

    wallet.my.resendTwoFactorSms(uid, success, error)

  wallet.create = (password, email, currency, language, success_callback) ->
    success = (uid) ->
      wallet.displaySuccess("Wallet created with identifier: " + uid, true)
      wallet.status.firstTime = true

      loginSuccess = () ->
        success_callback(uid)

      loginError = (error) ->
        console.log(error)
        wallet.displayError("Unable to login to new wallet")

      # Associate the UID with the beta key:
      if $rootScope.beta
        $http.post("/set_guid_for_beta_key", {key: $rootScope.beta.key, guid: uid}
        ).success((data) ->
          if(data.success)
            wallet.login(uid, password, null, null, loginSuccess, loginError)
          else
            if(data.error && data.error.message)
              Wallet.displayError(data.error.message)
        ).error () ->
          Wallet.displayWarning("Unable to associate your new wallet with your invite code. Please try to login using your UID " + uid + " or register again.", true)
      else
        wallet.login(uid, password, null, null, loginSuccess, loginError)

    error = (error) ->
      if error.message != undefined
        wallet.displayError(error.message)
      else
        wallet.displayError(error)

    currency_code = "USD"
    language_code = "en"

    if currency?
      currency_code = currency.code

    if language?
      language_code = language.code

    $translate("FIRST_ACCOUNT_NAME").then (translation) ->
      wallet.my.createNewWallet(email, password, translation,language_code, currency_code, success, error)

  wallet.createAccount = (name, successCallback, errorCallback) ->

    needsSecondPasswordCallback = (continueCallback) ->
      cancelCallback = () ->
        errorCallback()
      $rootScope.$broadcast "requireSecondPassword", continueCallback, cancelCallback

    success = (account) ->
      wallet.accounts.push(account)
      wallet.my.getHistoryAndParseMultiAddressJSON()
      successCallback()

    error = () ->
      errorCallback()

    wallet.my.createAccount(name, needsSecondPasswordCallback, success, error)

  wallet.renameAccount = (account, name, successCallback, errorCallback) ->
    if wallet.my.setLabelForAccount(account.index, name)
      account.label = name
      successCallback()
    else
      wallet.displayError("Failed to rename account")
      errorCallback()

  wallet.addAddressForAccount = (account, successCallback, errorCallback) ->
    labeledReceivingAddresses = wallet.my.getLabeledReceivingAddressesForAccount(account.index)
    # Add a new address rather than reuse the first one if no labeled addresses exist.
    if labeledReceivingAddresses.length == 0
      firstAvailableReceivingAddressIdx = wallet.my.getReceivingAddressIndexForAccount(account.index)

      wallet.my.setLabelForAccountAddress(account.index, firstAvailableReceivingAddressIdx, "", (()->), (()->))

    firstAvailableReceivingAddressIdx = wallet.my.getReceivingAddressIndexForAccount(account.index)

    success = () ->
      wallet.updateHDaddresses()
      address = wallet.my.getLabeledReceivingAddressesForAccount(account.index).slice(-1)[0]
      successCallback(address)

    error = () ->
      console.log "fail"
      errorCallback()

    wallet.my.setLabelForAccountAddress(account.index, firstAvailableReceivingAddressIdx, "", success, error)

  wallet.fetchMoreTransactions = (where, successCallback, errorCallback, allTransactionsLoadedCallback) ->
    success = (res) ->
      wallet.appendTransactions(res)
      # wallet.updateTransactions()
      successCallback()
      wallet.applyIfNeeded()

    error = () ->
      errorCallback()
      wallet.applyIfNeeded()

    allTransactionsLoaded = () ->
      allTransactionsLoadedCallback() if allTransactionsLoadedCallback?
      wallet.applyIfNeeded()

    if where == "accounts"
      wallet.my.fetchMoreTransactionsForAccounts(success, error, allTransactionsLoaded)
    else if where == "imported"
      wallet.my.fetchMoreTransactionsForLegacyAddresses(success, error, allTransactionsLoaded)
    else
      wallet.my.fetchMoreTransactionsForAccount(parseInt(where), success, error, allTransactionsLoaded)

  wallet.changeAddressLabel = (address, label, successCallback, errorCallback) ->
    if address.account? # HD Address
      success = () ->
         wallet.updateHDaddresses()
         successCallback()

      wallet.my.setLabelForAccountAddress(address.account.index, address.index, label, success, errorCallback)
    else # Legacy address
      success = () ->
        address.label = label
        successCallback()

      wallet.store.setLegacyAddressLabel(address.address, label, success, errorCallback)

  wallet.logout = () ->
    wallet.didLogoutByChoice = true
    $window.name = "blockchain"
    wallet.my.logout(true)
    return

  wallet.makePairingCode = (successCallback, errorCallback) ->
    success = (code) ->
      successCallback(code)
      wallet.applyIfNeeded()

    error = () ->
      errorCallback()
      wallet.applyIfNeeded()

    wallet.my.makePairingCode(success, error)

  wallet.confirmRecoveryPhrase = () ->
    wallet.store.didVerifyMnemonic()
    wallet.status.didConfirmRecoveryPhrase = true

  wallet.isCorrectMainPassword = (candidate) ->
    wallet.store.isCorrectMainPassword(candidate)

  wallet.isCorrectSecondPassword = (candidate) ->
    return true
    # wallet.my.isCorrectSecondPassword(candidate)

  wallet.changePassword = (newPassword, successCallback, errorCallback) ->
    wallet.store.changePassword(newPassword, (()->
      $translate("CHANGE_PASSWORD_SUCCESS").then (translation) ->
        wallet.displaySuccess(translation)
        successCallback(translation)
    ),() ->
      $translate("CHANGE_PASSWORD_FAILED").then (translation) ->
        wallet.displayError(translation)
        errorCallback(translation)
    )

  wallet.setIPWhitelist = (ips, successCallback, errorCallback) ->
    success = () ->
      wallet.settings.ipWhitelist = ips
      successCallback()
      wallet.applyIfNeeded()

    error = () ->
      errorCallback()
      wallet.applyIfNeeded()

    wallet.settings_api.update_IP_lock(ips, success, error)

  wallet.verifyEmail = (code, successCallback, errorCallback) ->
    success = () ->
      wallet.user.isEmailVerified = true
      successCallback()
      wallet.applyIfNeeded()

    wallet.settings_api.verifyEmail(code, success, errorCallback)

  wallet.resendEmailConfirmation = (successCallback, errorCallback) ->
    success = () ->
      successCallback()
      wallet.applyIfNeeded()

    error = () ->
      errorCallback()
      wallet.applyIfNeeded()

    wallet.settings_api.resendEmailConfirmation(wallet.user.email, success, error)

  wallet.setPbkdf2Iterations = (n, successCallback, errorCallback, cancelCallback) ->
    needsSecondPassword = (continueCallback) ->
      cancel = () ->
        cancelCallback()

      $rootScope.$broadcast "requireSecondPassword", continueCallback, cancel

    success = () ->
      wallet.settings.pbkdf2 = wallet.store.getPbkdf2Iterations()
      successCallback()
      wallet.applyIfNeeded()

    error = (error) ->
      errorCallback(error)

    wallet.my.setPbkdf2Iterations(parseInt(n), success, error, needsSecondPassword)

  ####################
  #   Transactions   #
  ####################

  wallet.recommendedTransactionFee = (origin, amount) ->
    # amount in Satoshi
    if !origin?
      return null

    if origin.address?
      return wallet.my.recommendedTransactionFeeForAddress(origin.address, amount)
    else if origin.index?
      return wallet.my.recommendedTransactionFeeForAccount(origin.index, amount)
    else
      return null

  #############
  # Spend BTC #
  #############

  # Converts units of fiat to BTC (not Satoshi)
  wallet.fiatToSatoshi = (amount, currency) ->
    return null if currency == "BTC"
    return null unless amount?
    return null unless wallet.conversions[currency]?
    return parseInt(numeral(amount).multiply(wallet.conversions[currency].conversion).format("0"))

  # amount in BTC, returns formatted amount in fiat
  wallet.BTCtoFiat = (amount, currency) ->
    return null if currency == "BTC"
    return null unless amount?
    return null unless wallet.conversions[currency]?
    return numeral(100000000).multiply(amount).divide(wallet.conversions[currency].conversion).format("0.00")

  wallet.isBitCurrency = (currency) ->
    return null unless currency?
    return ['BTC', 'mBTC', 'bits'].indexOf(currency.code) > -1

  wallet.convertCurrency = (amount, currency1, currency2) ->
    return null unless amount?
    return null unless (wallet.conversions[currency1.code]? || wallet.conversions[currency2.code]?)
    if wallet.isBitCurrency(currency1)
      return parseFloat(numeral(currency1.conversion).multiply(amount).divide(wallet.conversions[currency2.code].conversion).format("0.00"))
    else
      return parseFloat(numeral(amount).multiply(wallet.conversions[currency1.code].conversion).divide(currency2.conversion).format("0.00000000"))

  wallet.convertToSatoshi = (amount, currency) ->
    return null unless amount?
    return null unless currency?
    if wallet.isBitCurrency(currency)
      return parseInt(numeral(amount).multiply(currency.conversion).format("0"))
    else if wallet.conversions[currency.code]?
      return parseInt(numeral(amount).multiply(wallet.conversions[currency.code].conversion).format("0"))
    else
      return null

  wallet.convertFromSatoshi = (amount, currency) ->
    return null unless amount?
    return null unless currency?
    if wallet.isBitCurrency(currency)
      return parseFloat(numeral(amount).divide(currency.conversion).format("0.[00000000]"))
    else if wallet.conversions[currency.code]?
      return parseFloat(numeral(amount).divide(wallet.conversions[currency.code].conversion).format("0.[00]"))
    else
      return null

  wallet.toggleDisplayCurrency = () ->
    if wallet.isBitCurrency(wallet.settings.displayCurrency)
      wallet.settings.displayCurrency = wallet.settings.currency
    else
      wallet.settings.displayCurrency = wallet.settings.btcCurrency

  wallet.getFiatAtTime = (amount, time, currency) ->
    defer = $q.defer()
    # Cache the result since historical rates don't change within one session and we don't want to hammer the server
    key = amount + currency + time

    success = (fiat) ->
      wallet.fiatHistoricalConversionCache[key] = fiat
      defer.resolve(numeral(fiat).format("0.00"))

    error = (reason) ->
      defer.reject(reason)

    if wallet.fiatHistoricalConversionCache[key]
      success(wallet.fiatHistoricalConversionCache[key])
    else
      # The currency argument in the API is case sensitive.
      # Time argument in milliseconds
      wallet.api.getFiatAtTime(time * 1000, amount, currency.toLowerCase(), success, error)

    return defer.promise

  wallet.checkAndGetTransactionAmount = (amount, currency, success, error) ->
    amount = wallet.convertToSatoshi(amount, currency)

    if !success? || !error?
      console.error "Success and error callbacks are required"
      return

    return amount

  wallet.addAddressOrPrivateKey = (addressOrPrivateKey, needsBip38, successCallback, errorCallback) ->
    if addressOrPrivateKey == ""
      errorCallback({invalidInput: true})
      return

    bip38 = false

    needsSecondPasswordCallback = (continueCallback) ->
      cancelCallback = () ->
        errorCallback()

      $rootScope.$broadcast "requireSecondPassword", continueCallback, cancelCallback

    needsBip38Password = (callback) ->
      bip38 = true
      needsBip38(callback)

    alreadyImported = (address) ->
      errorCallback({addressPresentInWallet: true})
      wallet.applyIfNeeded() if bip38

    if address = wallet.my.isValidPrivateKey(addressOrPrivateKey)
      privateKey = addressOrPrivateKey
      if wallet.store.legacyAddressExists(address)
        address = $filter("getByProperty")("address", address, wallet.legacyAddresses)
        if address.isWatchOnlyLegacyAddress
          success = (address) ->
            # wallet.updateLegacyAddresses() # Probably too early
            successCallback({address: address})
            wallet.applyIfNeeded() if bip38

          error = (error) ->
            console.log "Error adding new key to existing address"
            wallet.applyIfNeeded() if bip38


          wallet.my.importPrivateKey(privateKey, needsSecondPasswordCallback, needsBip38Password, success, alreadyImported, error)
          return
        else
          alreadyImported()
          return

      else
        success = (address) ->
          addressItem = {address: address, isWatchOnlyLegacyAddress: false, active: true, legacy: true, balance: null}
          wallet.legacyAddresses.push addressItem
          # wallet.updateLegacyAddresses() # Probably too early
          successCallback(addressItem)
          wallet.applyIfNeeded() if bip38

          return

        error = (error) ->
          console.log "Error importing new key"
          console.log error
          wallet.displayError(error)
          wallet.applyIfNeeded() if bip38

        wallet.my.importPrivateKey(privateKey, needsSecondPasswordCallback, needsBip38Password, success, alreadyImported, error)
      return

    if wallet.my.isValidAddress(addressOrPrivateKey)
      address = addressOrPrivateKey
      if wallet.store.legacyAddressExists(address)
        errorCallback({addressPresentInWallet: true}, {address: address})
        return
      else
        wallet.my.addWatchOnlyLegacyAddress(address)
        addressItem = {address: address, isWatchOnlyLegacyAddress: true, active: true, legacy: true, balance: null}
        wallet.legacyAddresses.push addressItem
        # wallet.updateLegacyAddresses() # Probably too early
        successCallback(addressItem)
        return

    errorCallback({invalidInput: true})
    return

  wallet.transaction = (successCallback, errorCallback) ->
    success = (tx_hash) ->
        successCallback(tx_hash) # Allow caller to set a note before refreshing transactions

        wallet.updateTransactions() # This is also called by on_tx, but the note might not be set yet
        # wallet.updateLegacyAddresses()
        wallet.applyIfNeeded()

    error = (e) ->
      if e? && e.message != undefined
        errorCallback(e.message)
      else if e != null && e != undefined
        errorCallback(e)
      else
        errorCallback("Unknown error")
      wallet.applyIfNeeded()

    needsSecondPassword = (continueCallback) ->
      cancelCallback = () ->
        errorCallback()

      $rootScope.$broadcast "requireSecondPassword", continueCallback, cancelCallback

    {

      send: (from, destinations, amounts, fee, publicNote) ->

        destinations = destinations.map (dest) ->
          return dest.address unless dest.type == 'Accounts'
          return wallet.getReceivingAddressForAccount(dest.index)

        spender = wallet.spender(publicNote, success, error, {}, needsSecondPassword)

        if from.address?
          spendFrom = spender.fromAddress(from.address, 1000, fee)
        else if from.index?
          spendFrom = spender.fromAccount(from.index, 1000, fee)

        spendFrom.toAddresses(destinations, amounts)

      sweep: (fromAddress, toAccountIndex) ->
        spender = wallet.spender(null, success, error, {}, needsSecondPassword)
        spender.addressSweep(fromAddress.address).toAccount(toAccountIndex)

      # sendToEmail: (fromAccountIndex, email, amount, currency) ->
      #   amount = wallet.checkAndGetTransactionAmount(amount, currency, success, error)
      #   wallet.my.sendToEmail(fromAccountIndex, amount, 10000, email, success, error, {}, needsSecondPassword)
    }

  wallet.redeemFromEmailOrMobile = (account, claim, successCallback, error) ->
    success = () ->
      wallet.updateTransactions()
      successCallback()

    wallet.my.redeemFromEmailOrMobile(account.index, claim, success, error)

  wallet.fetchBalanceForRedeemCode = (code) ->
    defer = $q.defer();

    success = (balance) ->
      defer.resolve(balance)

    error = (error) ->
      console.log "Could not retrieve balance"
      console.log error
      defer.reject()

    wallet.my.getBalanceForRedeemCode(code, success, error)

    return defer.promise

  wallet.getAddressBookLabel = (address) ->
    wallet.my.wallet.getAddressBookLabel(address)

  wallet.getMnemonic = (successCallback, errorCallback, cancelCallback) ->
    needsSecondPasswordCallback = (continueCallback) ->
      cancel = () ->
        if cancelCallback?
          cancelCallback()

      $rootScope.$broadcast "requireSecondPassword", continueCallback, cancel

    success = (mnemonic, passphrase) ->
      successCallback(mnemonic, passphrase)

    error = (err="Unable to show mnemonic.") ->
      errorCallback(err)

    wallet.my.getHDWalletPassphraseString(needsSecondPasswordCallback, success, error)

  wallet.importWithMnemonic = (mnemonic, passphrase, successCallback, errorCallback) ->
    needsSecondPasswordCallback = (continueCallback) ->
      cancelCallback = () ->
      $rootScope.$broadcast "requireSecondPassword", continueCallback, cancelCallback

    wallet.accounts.splice(0, wallet.accounts.length)
    wallet.transactions.splice(0, wallet.transactions.length)

    success = () ->
      wallet.updateTransactions()
      wallet.updateHDaddresses()

      successCallback()

    $timeout((->
      wallet.my.recoverMyWalletHDWalletFromMnemonic(mnemonic, passphrase, needsSecondPasswordCallback, success, errorCallback)
    ), 100)

  wallet.getDefaultAccountIndex = () ->
    wallet.my.wallet.hdwallet.defaultAccountIndex

  wallet.getReceivingAddressForAccount = (idx) ->
    wallet.my.getReceivingAddressForAccount(idx)

  ###################
  # URL: bitcoin:// #
  ###################

  wallet.parsePaymentRequest = (url) ->
    result = { address: null, amount: null, label: null, message: null }
    result.isValid = true

    if url.indexOf('bitcoin:') == 0
      withoutPrefix = url.replace('bitcoin://', '').replace('bitcoin:', '')
      qIndex = withoutPrefix.indexOf('?')

      if qIndex != -1
        result.address = withoutPrefix.substr(0, qIndex)
        keys = withoutPrefix.substr(qIndex + 1).split('&')

        keys.forEach (item) ->
          key = item.split('=')[0]
          value = item.split('=')[1]

          if key == 'amount'
            result.amount = wallet.convertToSatoshi(parseFloat(value), wallet.btcCurrencies[0])
          else if result[key] != undefined
            result[key] = value

      else
        result.address = withoutPrefix

    else if wallet.my.isValidAddress(url)
      result.address = url

    else
      result.isValid = false

    return result

  ###################
  #      Other      #
  ###################
  wallet.lastAlertId = 0

  wallet.closeAlert = (alert) ->
    $timeout.cancel(alert.timer)
    wallet.alerts.splice(wallet.alerts.indexOf(alert))

  wallet.clearAlerts = () ->
    for alert in wallet.alerts
      wallet.alerts.pop(alert)
      if alert?
        $timeout.cancel(alert.timer)

  wallet.displayInfo = (message, keep=false) ->
    wallet.displayAlert {type: "info", msg: message}, keep

  wallet.displaySuccess = (message, keep=false) ->
    wallet.displayAlert {type: "success", msg: message}, keep

  wallet.displayWarning = (message, keep=false) ->
    wallet.displayAlert  {msg: message}, keep

  wallet.displayError = (message, keep=false) ->
    wallet.displayAlert {type: "danger", msg: message}, keep

  wallet.displayReceivedBitcoin = () ->
    $translate("JUST_RECEIVED_BITCOIN").then (translation) ->
      wallet.displayAlert {type: "received-bitcoin", msg: translation}

  wallet.displayAlert = (alert, keep=false) ->
    if !keep
      wallet.lastAlertId++
      alert.timer = $timeout((->
        wallet.alerts.splice(wallet.alerts.indexOf(alert))
      ), 7000)

    wallet.alerts.push(alert)

  wallet.isSynchronizedWithServer = () ->
    return wallet.store.isSynchronizedWithServer()

  window.onbeforeunload = (event) ->
    if !wallet.isSynchronizedWithServer()
      event.preventDefault()
      # This works in Chrome:
      return "There are unsaved changes. Are you sure?"

  wallet.isValidAddress = (address) ->
    return wallet.my.isValidAddress(address)

  wallet.archive = (address_or_account) ->
    if address_or_account.address?
      wallet.store.archiveLegacyAddr(address_or_account.address)
    else
      wallet.my.archiveAccount(address_or_account.index)

    address_or_account.active = false

  wallet.unarchive = (address_or_account) ->
    success = (txs) ->
      address_or_account.active = true

      if txs?
        wallet.appendTransactions(txs, false) # Re-insert tx with latest account info

      wallet.applyIfNeeded() # Unarchive involves an async operation

    if address_or_account.address?
      wallet.store.unArchiveLegacyAddr(address_or_account.address)
      success()
    else
      wallet.my.unarchiveAccount(address_or_account.index, success)


  wallet.deleteLegacyAddress = (address) ->
    wallet.store.deleteLegacyAddress(address.address)
    idx = wallet.legacyAddresses.indexOf(address)
    wallet.legacyAddresses.splice(idx,1)


  ##################################
  #        Private (other)         #
  ##################################

  # wallet.updateAccounts = () ->
  # wallet.status.didLoadBalances = true if wallet.accounts? && wallet.accounts.length > 0 && wallet.accounts.some((a) -> a.active and a.balance)

  # Update (labelled) HD addresses:
  wallet.updateHDaddresses = () ->
    for account in wallet.accounts
      continue if !account.active
      labeledAddresses = wallet.my.getLabeledReceivingAddressesForAccount(account.index)

      for address in labeledAddresses
        address.address = wallet.my.getReceiveAddressAtIndexForAccount(account.index, address.index)
        hdAddress = $filter("getByProperty")("address", address.address, wallet.hdAddresses)
        if hdAddress == null
          wallet.hdAddresses.push {
            index: address.index
            address: address.address
            label: address.label
            accountLabel: account.label
            account: account
          }
        else
          hdAddress.label = address.label

      if labeledAddresses.length == 0
        address = wallet.my.getReceivingAddressForAccount(account.index)
        if $filter("getByProperty")("address", address, wallet.hdAddresses) == null
          wallet.hdAddresses.push {
            index: wallet.my.getReceivingAddressIndexForAccount(account.index)
            address: address
            label: null # The last receiving address never has a label
            accountLabel: account.label
            account: account
          }

  wallet.total = (accountIndex) ->
    switch accountIndex
      when "accounts", undefined, null
        wallet.my.wallet.hdwallet.balanceActiveAccounts
      when "imported"
        wallet.my.wallet.balanceActiveLegacy
      else
        account = wallet.accounts[parseInt(accountIndex)]
        if account == null then null else account.balance

  wallet.updateTransactions = () ->
    for tx in wallet.store.getAllTransactions()
      match = false
      for candidate in wallet.transactions
        if candidate.hash == tx.hash
          match = true
          if !candidate.note?
            candidate.note = wallet.my.wallet.getNote(tx.hash) # In case a note was just set
          break

      if !match
        transaction = angular.copy(tx)
        transaction.note = wallet.my.wallet.getNote(transaction.hash)

        wallet.transactions.push transaction
    wallet.status.didLoadTransactions = true

  wallet.appendTransactions = (transactions, override) ->
    if not transactions? or not wallet.transactions?
      return
    for tx in transactions
      match = false
      for candidate in wallet.transactions
        if candidate.hash == tx.hash
          if override
            wallet.transactions.splice(wallet.transactions.splice(candidate))
          else
            match = true
          break

      if !match
        transaction = angular.copy(tx)
        transaction.note = wallet.store.getNote(transaction.hash)
        wallet.transactions.push transaction

  ####################
  # Notification     #
  ####################

  wallet.beep = () ->
    sound = ngAudio.load("beep.wav")
    sound.play()

  wallet.monitor = (event, data) ->
    if event == "on_tx" or event == "on_block"
      before = wallet.transactions.length
      wallet.updateTransactions()
      numberOfTransactions = wallet.transactions.length
      if numberOfTransactions > before
        wallet.beep()
        if wallet.transactions[numberOfTransactions - 1].result > 0 && !wallet.transactions[[numberOfTransactions - 1]].intraWallet
          wallet.displayReceivedBitcoin()
        # wallet.updateLegacyAddresses()
    else if event == "error_restoring_wallet"
      # wallet.applyIfNeeded()
      return
    else if event == "did_set_guid" # Wallet retrieved from server
    else if event == "on_wallet_decrypt_finish" # Non-HD part is decrypted
    else if event == "hd_wallets_does_not_exist"
      wallet.status.didUpgradeToHd = false
      continueCallback = () ->
        $translate("FIRST_ACCOUNT_NAME").then (translation) ->

          needsSecondPasswordCallback = (continueCallback) ->
            cancelCallback = () ->
            $rootScope.$broadcast "requireSecondPassword", continueCallback, cancelCallback, true

          success = () ->
            wallet.status.didUpgradeToHd = true
            # might not be necessary (if hd-wallet-Set is called)
            wallet.accounts = wallet.my.wallet.hdwallet.accounts
            wallet.updateHDaddresses()
            wallet.my.getHistoryAndParseMultiAddressJSON()

          error = () ->
            wallet.displayError("Unable to upgrade your wallet. Please try again.")
            wallet.my.upgradeToHDWallet(translation, needsSecondPasswordCallback, success, error)

          wallet.my.upgradeToHDWallet(translation, needsSecondPasswordCallback, success, error)

      $timeout(()->
        $rootScope.$broadcast "needsUpgradeToHD", continueCallback
        , 1000
      )

    else if event == "did_multiaddr" # Transactions loaded
      wallet.updateTransactions()
      # wallet.updateLegacyAddresses()
      wallet.status.didLoadBalances = true if wallet.my.wallet.isUpgradedToHD
      wallet.applyIfNeeded()
    else if event == "did_update_legacy_address_balance"
      console.log "did_update_legacy_address_balance"
      # wallet.updateLegacyAddresses()
      wallet.applyIfNeeded()

    else if event == "wallet not found" # Only works in the mock atm
      $translate("WALLET_NOT_FOUND").then (translation) ->
        wallet.displayError(translation)
    else if event == "ticker_updated" || event == "did_set_latest_block"
      wallet.applyIfNeeded()
    else if event == "logging_out"
      if wallet.didLogoutByChoice
        $translate("LOGGED_OUT").then (translation) ->
          $cookieStore.put("alert-success", translation)
      else
        $translate("LOGGED_OUT_AUTOMATICALLY").then (translation) ->
          $cookieStore.put("alert-warning", translation)
          wallet.applyIfNeeded()

      wallet.status.isLoggedIn = false
      while wallet.accounts.length > 0
        wallet.accounts.pop()
      while wallet.transactions.length > 0
        wallet.transactions.pop()
      while wallet.paymentRequests.length > 0
        wallet.paymentRequests.pop()
      wallet.uid = ""
      wallet.password = ""
      # $state.go("wallet.common.dashboard")
    else if event == "ws_on_close" || event == "ws_on_open"
      # Do nothing
    else if event.type != undefined
      if event.type == "error"
        wallet.displayError(event.msg)
        # console.log event
        wallet.applyIfNeeded()
      else if event.type == "success"
        wallet.displaySuccess(event.msg)
        wallet.applyIfNeeded()
      else if event.type == "notice"
        wallet.displayWarning(event.msg)
        wallet.applyIfNeeded()
      else
        # console.log event
    else
      # console.log event

  wallet.store.addEventListener((event, data) -> wallet.monitor(event, data))

  message = $cookieStore.get("alert-warning")
  if message != undefined && message != null
    wallet.displayWarning(message, true)
    $cookieStore.remove("alert-warning")

  message = $cookieStore.get("alert-success")
  if message != undefined && message != null
    wallet.displaySuccess(message)
    $cookieStore.remove("alert-success")

  ##################
  # Notes and tags #
  ##################
  wallet.setNote = (tx, text) ->
    wallet.store.setNote(tx.hash, text)

  wallet.deleteNote = (tx) ->
    wallet.store.deleteNote(tx.hash)

  ############
  # Settings #
  ############

  wallet.setLogoutTime = (minutes, success, error) ->
    wallet.store.setLogoutTime(minutes * 60000)
    wallet.settings.logoutTimeMinutes = minutes
    wallet.my.backupWalletDelayed()
    success()

  wallet.getLanguages = () ->
    # Get and sort languages:
    tempLanguages = []

    for code, name of wallet.store.getLanguages()
      language = {code: code, name: name}
      tempLanguages.push language

    tempLanguages = $filter('orderBy')(tempLanguages, "name")

    for language in tempLanguages
      wallet.languages.push language


  wallet.getCurrencies = () ->
    for code, name of wallet.store.getCurrencies()
      currency = {code: code, name: name}
      wallet.currencies.push currency

  wallet.getCurrency = () ->
    wallet.my.getCurrency()

  wallet.setLanguage = (language) ->
    $translate.use(language.code)
    wallet.settings.language = language

  wallet.changeLanguage = (language) ->
    wallet.settings_api.change_language(language.code, (()->))
    wallet.setLanguage(language)

  wallet.changeCurrency = (currency) ->
    wallet.settings_api.change_local_currency(currency.code)
    wallet.settings.currency = currency
    # wallet.fetchExchangeRate()

  wallet.changeBTCCurrency = (btcCurrency) ->
    wallet.settings_api.change_btc_currency(btcCurrency.serverCode)
    wallet.settings.btcCurrency = btcCurrency

  wallet.changeEmail = (email, successCallback, errorCallback) ->
    wallet.settings_api.change_email(email, (()->
      wallet.user.email = email
      wallet.user.isEmailVerified = false
      successCallback()
      wallet.applyIfNeeded()
    ), ()->
      $translate("CHANGE_EMAIL_FAILED").then (translation) ->
        wallet.displayError(translation)
        wallet.applyIfNeeded()

      errorCallback()
    )

  wallet.setFeePolicy = (policy) ->
    wallet.store.setFeePolicy(policy)
    wallet.settings.feePolicy = policy

  wallet.fetchExchangeRate = () ->
      # Exchange rate is loaded asynchronously:
      success = (result) ->
        for code, info of result
          # Converion:
          # result: units of fiat per BTC
          # convert to: units of satoshi per unit of fiat
          wallet.conversions[code] = {symbol: info.symbol, conversion: parseInt(numeral(100000000).divide(numeral(info["last"])).format("1"))}

        # if wallet.status.isLoggedIn
        #   wallet.updateLegacyAddresses()
        wallet.applyIfNeeded()

      fail = (error) ->
        console.log("Failed to load ticker:")
        console.log(error)

      wallet.api.get_ticker(success, fail)

  wallet.isEmailVerified = () ->
    wallet.my.isEmailVerified

  wallet.internationalPhoneNumber = (mobile) ->
    return null unless mobile?
    mobile.country + " " + mobile.number.replace(/^0*/, '')

  wallet.changeMobile = (mobile, successCallback, errorCallback) ->

    wallet.settings_api.changeMobileNumber(this.internationalPhoneNumber(mobile), (()->
      wallet.user.mobile = mobile
      wallet.user.isMobileVerified = false
      successCallback()
      wallet.applyIfNeeded()
    ), ()->
      $translate("CHANGE_MOBILE_FAILED").then (translation) ->
        wallet.displayError(translation)
      errorCallback()
      wallet.applyIfNeeded()
    )

  wallet.verifyMobile = (code, successCallback, errorCallback) ->
    wallet.settings_api.verifyMobile(code, (()->
      wallet.user.isMobileVerified = true
      successCallback()
      wallet.applyIfNeeded()
    ), ()->
      $translate("VERIFY_MOBILE_FAILED").then (translation) ->
        errorCallback(translation)
      wallet.applyIfNeeded()
    )

  wallet.applyIfNeeded = () ->
    if MyWallet.mockShouldReceiveNewTransaction == undefined
      $rootScope.$apply()

  wallet.changePasswordHint = (hint, successCallback, errorCallback) ->
    wallet.settings_api.update_password_hint1(hint,(()->
      wallet.user.passwordHint = hint
      successCallback()
      wallet.applyIfNeeded()
    ),(err)->
      errorCallback(err)
      wallet.applyIfNeeded()
    )

  wallet.isMobileVerified = () ->
    wallet.my.isMobileVerified

  wallet.disableSecondFactor = () ->
    wallet.settings_api.unsetTwoFactor(()->
      wallet.settings.needs2FA = false
      wallet.settings.twoFactorMethod = null
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )

  wallet.setTwoFactorSMS = () ->
    wallet.settings_api.setTwoFactorSMS(()->
      wallet.settings.needs2FA = true
      wallet.settings.twoFactorMethod = 5
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )

  wallet.setTwoFactorEmail = () ->
    wallet.settings_api.setTwoFactorEmail(()->
      wallet.settings.needs2FA = true
      wallet.settings.twoFactorMethod = 2
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )

  wallet.setTwoFactorYubiKey = (code, successCallback, errorCallback) ->
    wallet.settings_api.setTwoFactorYubiKey(
      code
      ()->
        wallet.settings.needs2FA = true
        wallet.settings.twoFactorMethod = 3
        successCallback()
        wallet.applyIfNeeded()
      (error)->
        console.log(error)
        errorCallback(error)
        wallet.applyIfNeeded()
    )

  wallet.setTwoFactorGoogleAuthenticator = () ->
    wallet.settings_api.setTwoFactorGoogleAuthenticator((secret)->
      wallet.settings.googleAuthenticatorSecret = secret
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )

  wallet.confirmTwoFactorGoogleAuthenticator = (code, successCallback, errorCallback) ->
    wallet.settings_api.confirmTwoFactorGoogleAuthenticator(code, ()->
      wallet.settings.needs2FA = true
      wallet.settings.twoFactorMethod = 4
      wallet.settings.googleAuthenticatorSecret = null
      successCallback()
      wallet.applyIfNeeded()
    ,()->
      errorCallback()
      wallet.applyIfNeeded()
    )

  wallet.enableRememberTwoFactor = (successCallback, errorCallback) ->
    success = () ->
      wallet.settings.rememberTwoFactor = true
      successCallback()
      wallet.applyIfNeeded()

    error = () ->
      errorCallback()
      wallet.applyIfNeeded()

    wallet.settings_api.toggleSave2FA(false, success, error)

  wallet.disableRememberTwoFactor = (successCallback, errorCallback) ->
    success = () ->
      wallet.settings.rememberTwoFactor = false
      successCallback()
      wallet.applyIfNeeded()

    error = () ->
      errorCallback()
      wallet.applyIfNeeded()

    wallet.settings_api.toggleSave2FA(true, success, error)

  wallet.handleBitcoinLinks = () ->
    $window.navigator.registerProtocolHandler('bitcoin', window.location.origin + '/#/open/%s', "Blockchain")

  wallet.enableBlockTOR = () ->
    wallet.settings_api.update_tor_ip_block(1, ()->
      wallet.settings.blockTOR = true
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )

  wallet.disableBlockTOR = () ->
    wallet.settings_api.update_tor_ip_block(0, ()->
      wallet.settings.blockTOR = false
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )

  wallet.enableApiAccess = () ->
    wallet.settings_api.update_API_access(true, ()->
      wallet.settings.apiAccess = true
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )

  wallet.disableApiAccess = () ->
    wallet.settings_api.update_API_access(false, ()->
      wallet.settings.apiAccess = false
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )

  wallet.enableRestrictToWhiteListedIPs = () ->
    wallet.settings_api.update_IP_lock_on(true, ()->
      wallet.settings.restrictToWhitelist = true
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )

  wallet.disableRestrictToWhiteListedIPs = () ->
    wallet.settings_api.update_IP_lock_on(false, ()->
      wallet.settings.restrictToWhitelist = false
      wallet.applyIfNeeded()
    ,()->
      console.log "Failed"
      wallet.applyIfNeeded()
    )

  wallet.getTotalBalanceForActiveLegacyAddresses = () ->
    return wallet.store.getTotalBalanceForActiveLegacyAddresses()

  wallet.setDefaultAccount = (account) ->
    wallet.store.changeDefaultAccountIndex(account.index)

  wallet.isValidBIP39Mnemonic = (mnemonic) ->
    wallet.my.isValidateBIP39Mnemonic(mnemonic)

  wallet.removeSecondPassword = (successCallback, errorCallback) ->
    needsSecondPasswordCallback = (continueCallback) ->
      cancelCallback = () ->
        errorCallback()

      $rootScope.$broadcast "requireSecondPassword", continueCallback, cancelCallback

    success = () ->
      wallet.displaySuccess("Second password has been removed.")
      wallet.settings.secondPassword = false
      successCallback()

    error = () ->
      errorCallback()

    wallet.my.unsetSecondPassword(success, error, needsSecondPasswordCallback)

  wallet.validateSecondPassword = (password) ->
    wallet.my.validateSecondPassword(password)

  wallet.setSecondPassword = (password, successCallback) ->
    success = () ->
      wallet.displaySuccess("Second password set.")
      wallet.settings.secondPassword = true
      successCallback()

    error = () ->

    wallet.my.setSecondPassword(password, success, error)


  ########################################
  # Testing: only works on mock MyWallet #
  ########################################

  wallet.refresh = () ->
    wallet.my.refresh()
    # wallet.updateLegacyAddresses()
    wallet.updateTransactions()

  wallet.isMock = wallet.my.mockShouldFailToSend != undefined
  wallet.getLanguages()
  wallet.getCurrencies()

  return  wallet
