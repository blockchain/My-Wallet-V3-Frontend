walletServices = angular.module("myWalletServices", [])
walletServices.factory "MyWallet", ($window, $timeout, $log, localStorageService, $cookieStore) ->
  # Erase local storage:
  # localStorageService.remove("mockWallets")

  # $cookieStore.remove("uid")
  # $cookieStore.remove("password")

  # console.log localStorageService.get("mockWallets")
  
  # Wallets are stored in a cookie. If there isn't one, we'll create it.
  unless localStorageService.get("mockWallets") 
    localStorageService.set("mockWallets", {
      "test": {
        password: "test"
        two_factor: null
        email_verified: true
        accounts: [
          {label: "Savings", archived: false, balance: 300000000 - 25000000, receive_addresses: []},
          {label: "Mobile", archived: false, balance: 25000000 - 1500000, receive_addresses: ["13QsKpDMchnssikZEaJKdkTX7pycFEcTi1"]}
        ]
        transactions: [
          {
            hash: "aaaa", confirmations: 13, doubleSpend: false, coinbase: false, intraWallet: false, txTime: 1331300839, 
            from: {account: null, legacyAddresses: null, externalAddresses: {addressWithLargestOutput: "1D2YzLr5qvrwMSm8onYbns5BLJ9jwzPHcQ", amount: 300000000}}, 
            to: {account: {index: 0, amount: 300000000}, legacyAddresses: null}
          }
          {
            hash: "aaab", confirmations: 3, doubleSpend: false, coinbase: false, intraWallet: true, note: null, txTime:   2000000000, 
            from: {account: {index: 0, amount: 25000000}, legacyAddresses: null}, 
            to:   {account: {index: 1, amount: 25000000}, legacyAddresses: null}
          }
          {
            hash: "afsdfsdkj", confirmations: 1, doubleSpend: false, coinbase: false, intraWallet: false, note: null, txTime:   8200000000, 
            from: {account: {index: 1, amount: 1500000}, legacyAddresses: null}  
            to: {account: null, legacyAddresses: null, externalAddresses: {addressWithLargestOutput: "1LJuG6yvRh8zL9DQ2PTYjdNydipbSUQeq", amount: 1500000}}
          }
          {
            hash: "afsdfsdkj", confirmations: 1, doubleSpend: false, coinbase: false, intraWallet: false, note: null, txTime: 8300000000
            from: {account: null, legacyAddresses: null, externalAddresses: {addressWithLargestOutput: ["somewhere"], amount: 1500000}}, 
            to: {account: null, legacyAddresses: null, externalAddresses: {addressWithLargestOutput:"some_legacy_archived_address_with_money", amount: 1500000}}
          }
        ]
        legacyAddresses: {
          "some_legacy_address":            {privateKey: "legacy_private_key", label: "Old", balance: 10000000}
          "some_legacy_watch_only_address": {privateKey: null, label: "Paper wallet", balance: 20000000}
          "some_legacy_address_without_label": {privateKey: "legacy_no_label_private_key", label: null, balance: 30000000}
          "some_legacy_archived_address":   {privateKey: "legacy_archived", archived: true, balance: 0}
          "some_legacy_archived_address_with_money":   {privateKey: "legacy_archived_with_money", archived: true, balance: 40000000}
          
        }
        
        notes: {
          "aaaa" : "Salary"
        }
      },
      "test-unverified" : {
        password: "test"
        two_factor: null
        email_verified: false
        accounts: [
          {label: "Spending", balance: 0, receive_addresses: []}
        ]
        transactions: []
        notes: {}
        legacyAddresses: {}
      },
      "test-2FA" : {
        password: "test"
        email_verified: true
        two_factor: 4
        two_factor_code: "123456"
        accounts: [
          {label: "Spending", balance: 0, receive_addresses: []}
        ]
        transactions: []
        notes: {}
        legacyAddresses: {}
      }
    })
            
  uid = undefined
  
  isSynchronizedWithServer = true # In the sense that the server is up to date
  
  myWallet = {}
  accounts = []
    
  transactions = []
  notes = {}
  legacyAddresses = []
  
  language = "en"
  email = "steve@me.com"
  mobile = "+31 12345678"
  
  defaultAccountIndex = 0
  
  feePolicy = 0

  monitorFunc = undefined  # New system
  eventListener = undefined # Old system
  
  mockRules = {shouldFailToSend: false, shouldFailToCreateWallet: false}
  
  myWallet.addressBook = { # The same for everyone
    "17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq": "John"
    "1LJuG6yvRh8zL9DQ2PTYjdNydipbSUQeq": "Alice"
  }
  
  myWallet.getAddressBook = () ->
    myWallet.addressBook
  
  mockRequestAddressStack = [ # Same for everyone
    "1Hj9XKGY6Fh8koVh6CuTJsQnuiSQrd9iCx"
    "1Bp85Lymp2ViRZwhbsD8NnDgRkEyai9w7i"
    "1LeoeftCD56juxPuGYh1m1bSrPxkBu44aH"
    "1B4mSrAoDCufBDNaRbBLVEMiKyuGbG2hYh"
    "17Nxxw6nS8bqUSGEZ6a3YWsCjCr15reLiy"
    "1b1da7mU4KAue6BBXYFD7wDfNRmRi3bjH"
    "1KERjvoD6yPY4qEovfaTmgwcR6SfhMoeSJ"
    "1JGAyzFGQNpQhjbD1ue528QhuYtbRos7Ax"
    "1C9KKvTW94C4wiwqL5whVPUEAwmGJLXEvt"
    "12L5nz6AYye5DJiWbgCAvkSJBUok1WZPij"
    "1J85hDKybYPXcXY78izocQpezEShW6xfc8"
    "1ggDhwUX5LRsJHeeEYn8MEimBKNco2Ywq"
    "1Gyz5MPYY1ZKLcvmXSPHMAi1xpHbdCGaUN"
    "1M4YSYCarkSeNUk9D1o3F7hHFL9c2EYums"
    "1LKwobBwhVwq4HF7NqBeebVg4UTLgS3bc5"
    "1MgYrhUtb5RfV5DTaWiLGTbSMVKuFNVC7Y"
    "1Q57Pa6UQiDBeA3o5sQR1orCqfZzGA7Ddp"
  ]
  
  myWallet.getLegacyAddressBalance = (address) ->
    return legacyAddresses[address].balance
    
  myWallet.setLegacyAddressLabel = (label) ->
    return
  
  myWallet.setLabelForAccountAddress = (accountIdx, addressIdx, label) ->
    return
    
  myWallet.getTotalBalanceForActiveLegacyAddresses = () ->
    tally = 0
    for key, value of legacyAddresses
      tally += value.balance
    return tally
  
  myWallet.getHDWallet = () ->
    myWallet 
    
  myWallet.didUpgradeToHd = () ->
    return true
    
  myWallet.isValidateBIP39Mnemonic = (mnemonic) ->
    return false unless mnemonic?
    return false if mnemonic.indexOf(" ") == -1
    return false if mnemonic.split(" ").length < 3
    return true
    
  myWallet.getHDWalletPassphraseString = (getPassword, success, error) ->
    success("banana big me hungry very must eat now")
    
  myWallet.fetchWalletJson = (uid, dummy1, dummy2, password, two_factor_code, success, needs_2fa, wrong_2fa) ->
    if wallet = localStorageService.get("mockWallets")[uid]
      myWallet.uid = uid
      eventListener("did_set_guid")
      
      if wallet.two_factor
        if two_factor_code
          if two_factor_code != wallet.two_factor_code
            wrong_2fa()
        else
          needs_2fa(wallet.two_factor)
          return
      
      unless password && password == wallet.password
        monitorFunc({type: "error", message: "Wrong password", code: 0});
        return
      
      myWallet.password = password
    
    
      success()
      eventListener("on_wallet_decrypt_finish")
      return

    else
      $log.error "Wallet not found"
      eventListener("wallet not found")
      
  myWallet.isMnemonicVerified = () ->
    false
    
  myWallet.didVerifyMnemonic = () ->
      
  myWallet.getHistoryAndParseMultiAddressJSON = () ->
    this.refresh()
    eventListener("did_multiaddr")
      
  myWallet.createNewWallet = (email, pwd, language, currency, success, fail) ->
    uid = String(Math.floor((Math.random() * 100000000) + 1))
    
    if mockRules.shouldFailToCreateWallet
      fail({message: "Mock asked to fail"})
      return
    
    wallets = localStorageService.get("mockWallets")
    if wallets[uid]
      fail({message: "Wallet already exists"})
    else
      wallets[uid] = {
        password: pwd
        accounts: [
          {label: "Spending", archived: false, balance: 0, receive_addresses: []}
        ]
        transactions: []
        language: language
        currency: currency
      }
      localStorageService.set("mockWallets", wallets)
      success(uid)
  
  myWallet.logout = () ->
    eventListener("logging_out")
    myWallet.uid = undefined
    myWallet.password = undefined
    transactions = []
    accounts = []
    if !(karma?) || !karma
      window.location = ""
      
  myWallet.isCorrectMainPassword = (candidate) ->
    return candidate == myWallet.password
    
  myWallet.changePassword = (newPassword) ->
    myWallet.password = newPassword
    # wallets = localStorageService.get("mockWallets")
    # wallets[myWallet.uid].password = newPassword
    # localStorageService.set("mockWallets", wallets)
      
  myWallet.get_ticker = (success, fail) ->
    success({
      EUR: {"15m": 250, symbol: "€"}
      USD: {"15m": 300, symbol: "$"}
    })
 
  myWallet.getLanguage = () ->
    return language
    
    
  myWallet.get_account_info = (callback) ->
    callback({
      email: email
      email_verified: 1
      sms_number: mobile
      sms_verified: 0
      password_hint1: "Same as username"
      language: language
      currency: "USD"
      block_tor_ips: 0
    })
    
  myWallet.getLanguages = () ->
    {de: "Deutch", en: "English", nl: "Nederlands"}
    
  myWallet.getCurrencies = () ->
    {USD: "US Dollar", EUR: "Euro"}

  myWallet.change_email = (newVal, success, error) ->
    email = newVal
    success()
    
  myWallet.changeMobileNumber = (newVal, success, error) ->
    mobile = newVal
    success()
    
  myWallet.verifyMobile = (code, success, error) ->
    success()
    
  myWallet.update_password_hint1 = (value, success, fail) ->
    success()
    
  myWallet.change_language = (newLanguage) ->
    language = newLanguage
    
  myWallet.change_local_currency = (newCurrency) ->
    currency = newCurrency
    
  myWallet.getAccounts = () ->  
    theAccounts = []
    for i in [0..myWallet.getAccountsCount()]
      theAccounts.push myWallet.getAccount(i)
    return theAccounts
    
  myWallet.getAccountsCount = () ->
    return accounts.length
    
  myWallet.getLabelForAccount = (idx) ->
    return null unless idx?
    return null if accounts.length < idx - 1
    return null unless accounts[idx]?
    return accounts[idx].label
    
  myWallet.getBalanceForAccount = (idx) ->
    return accounts[idx].balance
    
  myWallet.createAccount = (label, needsPasswordCallback, successCallback, errorCallback) ->
    accounts.push {label: label, archived: false, balance: 0, receive_addresses: [] }
    myWallet.sync()
    successCallback()
    
  myWallet.setLabelForAccount = (idx, label) ->
    accounts[idx].label = label
    
  myWallet.getAllTransactions = (idx) ->
    res = []
    for transaction in transactions
      res.push transaction
    
    return res
    
  myWallet.getNote = (hash) ->
    notes[hash]
    
  myWallet.setNote = (hash, text) ->
    notes[hash] = text
    myWallet.sync()
    return
    
  # Amount in Satoshi
  myWallet.sendBitcoinsForAccount = (fromAccountIndex,toAddress, amount, fee, note, success, error) ->
    if mockRules.shouldFailToSend
      error({message: "Reason for failure"})
      return
      
    # A few sanity checks (not complete)
    if amount > accounts[fromAccountIndex].balance
      error({message: "Insufficient funds"})
      return
    
    ###
    The MyWallet mock parses transactions by just copying them, so the following 
    transaction is what a real transaction would look like  *after* processing. 
    
    The real transaction may have several inputs (from receiving and change address 
    for this account). A new change address may need to be generated.
    
    Transaction parsing should be able to figure out which account was the sender and 
    change address and which address represents a recipient.
    ###
    
    transaction = {
            hash: "hash-" + (new Date()).getTime(), 
            confirmations: 0
            doubleSpend: false
            intraWallet: false, 
            note: null, 
            txTime: (new Date()).getTime()
            from: {account: {index: fromAccountIndex, amount: amount}, legacyAddresses: null, externalAddresses: null}, 
            to: {account: null, legacyAddresses: null, externalAddresses: {addressWithLargestOutput: toAddress, amount: amount}}
          }
    
    # MyWallet stores transaction locally (so it already knows it by the time
    # it receives the websocket notification).

    transactions.push transaction
    accounts[fromAccountIndex].balance -= amount
    
    # Blockchain.info will know about these transactions:
    cookie = localStorageService.get("mockWallets")
    cookie[this.uid].accounts[fromAccountIndex].balance -= amount
    cookie[this.uid].transactions.push transaction
    localStorageService.set("mockWallets", cookie)
    
    success()
    
    return
  
  myWallet.sendToAccount = (fromAccountIdx, toAccountIdx, amount, feeAmount, note, success, error, getPassword) ->
    transaction = {
            hash: "hash-" + (new Date()).getTime(), 
            confirmations: 0
            doubleSpend: false
            intraWallet: true, 
            note: null, 
            txTime: (new Date()).getTime()
            from: {account: {index: fromAccountIdx, amount: amount}, legacyAddresses: null, externalAddresses: null}, 
            to:   {account: {index: toAccountIdx, amount: amount}, legacyAddresses: null, externalAddresses: null}
          }

    transactions.push transaction
    accounts[fromAccountIdx].balance -= amount
    accounts[toAccountIdx].balance += amount   
    
    success()
    
    return
     
  
  myWallet.sendFromLegacyAddressToAccount = (fromAddress, toAccountIdx, amount, feeAmount, note, success, error, getPassword) ->
    transaction = {
              hash: "hash-" + (new Date()).getTime(), 
              confirmations: 0
              doubleSpend: false
              intraWallet: true, 
              note: null, 
              txTime: (new Date()).getTime()
              from: {account: null, legacyAddresses: [{address: fromAddress, amount: amount}], externalAddresses: null}, 
              to:   {account: {index: toAccountIdx, amount: amount}, legacyAddresses: null, externalAddresses: null}
            }

    transactions.push transaction
    legacyAddresses[fromAddress].balance -= amount
    accounts[toAccountIdx].balance += amount   
    
    success()
    
    return
    
  myWallet.initializeHDWallet = () ->
    
  myWallet.sweepLegacyAddressToAccount = (fromAddress, toAccountIndex, observer) ->
    accounts[toAccountIndex].balance = legacyAddresses[fromAddress].balance
    legacyAddresses[fromAddress].balance = 0
    return
    
  myWallet.sendToEmail = (accountIdx, value, fixedFee, email, successCallback, errorCallback) ->
    successCallback()  
    
  myWallet.getBalanceForRedeemCode = (code, success, error) ->
    success(100000)

  myWallet.redeemFromEmailOrMobile = (accountIdx, code, success, error) ->
    amount = myWallet.getBalanceForRedeemCode(code, 
      (amount) ->
        accounts[accountIdx].balance += amount
        success()
      ,(()->)
    )
    
    
    
    
  myWallet.getReceivingAddressForAccount = (accountIdx) ->
    if mockRequestAddressStack.length == 0
      $log.error "No more mock payment request addresses; please refresh."
      return {amount: 0, address: "No more mock addresses available"}
    
    address = mockRequestAddressStack.pop()
    
    return address
    
  myWallet.getReceivingAddressIndexForAccount = (accountIdx) ->
    return 0
  
  # Amount in Satoshi  
  myWallet.getAccount = (index) ->
    if index < 0
      return
      
    account = {}
    
    return account
  
  myWallet.addEventListener = (func) ->
    eventListener = func
    
  myWallet.monitor = (func) ->
    monitorFunc = func
    
  # Pending refactoring of MyWallet:
  $window.symbol_local = {code: "USD",conversion: 250000.001, local: true, name: "Dollar", symbol: "$", symbolAppearsAfter: false}
    
  myWallet.isSynchronizedWithServer = () ->
    return isSynchronizedWithServer
    
  myWallet.recommendedTransactionFeeForAccount = () ->
    return 10000
    
  myWallet.recommendedTransactionFeeForAddress = () ->
    return 10000
    
  ####################
  # Legacy addresses #
  ####################
  myWallet.getAllLegacyAddresses = () ->
    res = []
    for key, value of legacyAddresses
      res.push key
    return res
    
  myWallet.getLegacyActiveAddresses = () ->
    activeAddresses = []
    for key, value of legacyAddresses
      unless value.archived
        activeAddresses.push key
    return activeAddresses
    
  myWallet.getLegacyAddressLabel = (address) ->
    return legacyAddresses[address].label
    
  myWallet.isWatchOnlyLegacyAddress = (address) ->
    return legacyAddresses[address].privateKey == null
    
  myWallet.archiveLegacyAddr = (address) ->
    return
  
  myWallet.unArchiveLegacyAddr = (address) ->
    return
    
  myWallet.deleteLegacyAddress = (address) ->
    return
    
  myWallet.makePairingCode = () ->
    return ""
    
  myWallet.addWatchOnlyLegacyAddress = (address) ->
    legacyAddresses[address] =  {privateKey: null, balance: 300000000}
    return
    
  myWallet.isValidPrivateKey = (candidate) ->
    if candidate == "BIP38 key"
      return true
    else if candidate.indexOf("private_key_for_") > -1
      return candidate.replace("private_key_for_","")
    else 
      return false
      
  myWallet.isValidAddress = (address) ->
    withoutWhiteSpace = address.trim()
    # Reject if there are spaces inside the address:
    return withoutWhiteSpace.indexOf(" ") == -1 && withoutWhiteSpace.indexOf("@") == -1 && withoutWhiteSpace.indexOf("/") == -1
    
  myWallet.importPrivateKey = (privateKey, getPassword, getBip38Password, successCallback, errorCallback) ->
    if privateKey == "BIP38 key"
      getBip38Password((password)->
        if password == "5678"
          successCallback("some address")
        else 
          console.log "Wrong password!"
      )
    else    
      address = privateKey.replace("private_key_for_","")
      legacyAddresses[address] =  {privateKey: privateKey, balance: 200000000}
      successCallback(address)
    
  myWallet.recoverMyWalletHDWalletFromMnemonic = (mnemonic, pwd) ->
    accounts.splice(0,accounts.length)
    accounts.push({name: "Account #0", balance: 0})
      
  myWallet.legacyAddressExists = (candidate) ->
    return legacyAddresses[candidate]?
    
  myWallet.getLabeledReceivingAddressesForAccount = () ->
    return []
        
  myWallet.getFiatAtTime = (time, value, currencyCode, successCallback, errorCallback) ->
    successCallback(3.2)
    
  myWallet.getDefaultAccountIndex = () ->
    return defaultAccountIndex
    
  myWallet.setDefaultAccountIndex = (idx) ->
    defaultAccountIndex = idx
    return
    
  ############################################################
  # Simulate spontanuous behavior when using mock in browser #
  ############################################################

    
  ###################################
  # Fake methods useful for testing #
  ###################################
  
  myWallet.sync = () ->
    isSynchronizedWithServer = false
    
    if myWallet.pendingSync != undefined
      $timeout.cancel(myWallet.pendingSync)
      
    myWallet.pendingSync = $timeout((->
      # Save payment requests and accounts in our cookie:
      cookie = localStorageService.get("mockWallets")
      unless cookie[myWallet.uid]
        console.log "User " + myWallet.uid + " not found in local storage."
        console.log localStorageService.get("mockWallets")
        return 
        
      cookie[myWallet.uid].accounts = accounts
      cookie[myWallet.uid].notes = notes
      cookie[myWallet.uid].legacyAddresses = legacyAddresses
      
            
      localStorageService.set("mockWallets", cookie)
      isSynchronizedWithServer = true
    ), 5000)
    
  
  myWallet.refresh = () ->
    accounts = angular.copy(localStorageService.get("mockWallets")[this.uid].accounts)
    transactions = angular.copy(localStorageService.get("mockWallets")[this.uid].transactions)
    notes = angular.copy(localStorageService.get("mockWallets")[this.uid].notes)
    legacyAddresses = angular.copy(localStorageService.get("mockWallets")[this.uid].legacyAddresses)
    
  myWallet.unsetTwoFactor = (success, error) ->
    success()
    
  myWallet.setTwoFactorSMS = (success, error) ->
    success()
    
  myWallet.setTwoFactorEmail = (success, error) ->
    success()
    
  myWallet.setTwoFactorGoogleAuthenticator = (success, error) ->
    success("google_secret")
    
  myWallet.confirmTwoFactorGoogleAuthenticator = (code, success, error) ->
    if code == "123456"
      success()
    else
      error()
    
  myWallet.getFeePolicy = () ->
    return feePolicy
    
  myWallet.setFeePolicy = (policy) ->
    feePolicy = policy
    return
    
  myWallet.getDoubleEncryption = () ->
    return false
    
  myWallet.setSecondPassword = (password, success, error) ->
    success()
    
  myWallet.getMainPasswordPbkdf2Iterations = () ->
    10
    
  myWallet.setPbkdf2Iterations = (pbkdf2_iterations, success) ->
    success()
    
  myWallet.getSecondPasswordPbkdf2Iterations = () ->
    10
    
  myWallet.update_tor_ip_block = (enabled, successCallback, errorCallback) ->
    successCallback()
    
  #####################################
  # Tell the mock to behave different # 
  #####################################
  myWallet.mockShouldFailToSend = () ->
    mockRules.shouldFailToSend = true
    
  myWallet.mockShouldFailToCreateWallet = () ->
    mockRules.shouldFailToCreateWallet = true
    
  myWallet.mockShouldReceiveNewTransaction = (address="13QsKpDMchnssikZEaJKdkTX7pycFEcTi1", from="17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq", amount=400000, note="Thanks for the tea") ->
    this.mockProcessNewTransaction {
      hash: "mock-receive-" + (new Date()).getTime() 
      confirmations: 0
      intraWallet: false
      note: note
      txTime: (new Date()).getTime() 
      from: {account: null, legacyAddresses: null, externalAddresses: {addressWithLargestOutput: from, amount: amount}}, 
      to: address
      result: amount
    }
   
    # this.mockProcessNewTransaction { amount: amount, confirmations: 0, doubleSpend: false, coinbase: false, intraWallet: false, from_account: null, from_addresses: [from], to: address , note: note, txTime: }
    
    eventListener("on_tx")
    
  myWallet.mockProcessNewTransaction = (transaction) ->  
    
    # Match "to" address to receive address to figure out which account it was sent to:
    for account in accounts
      for address in account.receive_addresses
        if address == transaction.to
          index = accounts.indexOf(account)
          accounts[index].balance += transaction.result
          transaction.to = {account: {index: index, amount: transaction.result}, legacyAddresses: null, externalAddresses: null}
          
          transactions.push transaction
          
          # Update the "blockchain" in our cookie:
          cookie = localStorageService.get("mockWallets")
          cookie[this.uid].accounts[index].balance += transaction.result
          cookie[this.uid].transactions.push transaction
          localStorageService.set("mockWallets", cookie)
          
          break

  myWallet.mockShouldReceiveNewBlock = () ->
    eventListener("on_block")
  
  return myWallet 