walletServices = angular.module("myWalletServices", [])
walletServices.factory "MyWallet", ($window, $timeout, $log, localStorageService, $cookieStore, MyWalletStore) ->
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
          {label: "Old", archived: true, balance: 0, receive_addresses: []}
       
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
  
  myWallet = {}
  accounts = []
  
  shouldFetchOldestTransaction = false
          
  mockRules = {shouldFailToSend: false, shouldFailToCreateWallet: false}
    
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
  
  myWallet.setLabelForAccountAddress = (accountIdx, addressIdx, label) ->
    return

  myWallet.wallet = {
    isUpgradedToHD: true
    hdwallet: {
      isMnemonicVerified: true
      accounts: []
    }
    keys: []
  }
        
  myWallet.isValidateBIP39Mnemonic = (mnemonic) ->
    return false unless mnemonic?
    return false if mnemonic.indexOf(" ") == -1
    return false if mnemonic.split(" ").length < 3
    return true
    
  myWallet.getHDWalletPassphraseString = (getPassword, success, error) ->
    success("banana big me hungry very must eat now")
                
  myWallet.getHistoryAndParseMultiAddressJSON = () ->
    this.refresh()
    MyWalletStore.sendEvent("did_multiaddr")
    MyWalletStore.sendEvent("hd_wallet_set")
       
  myWallet.getLanguage = () ->
    return language
    
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
    
  myWallet.sweepLegacyAddressToAccount = (fromAddress, toAccountIndex, observer) ->
    accounts[toAccountIndex].balance = MyWalletStore.getLegacyAddressBalance(fromAddress)
    MyWalletStore.setLegacyAddressBalance(fromAddress, 0)
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
      
  myWallet.monitor = (func) ->
    monitorFunc = func
    
  # Pending refactoring of MyWallet:
  $window.symbol_local = {code: "USD",conversion: 250000.001, local: true, name: "Dollar", symbol: "$", symbolAppearsAfter: false}
    
  myWallet.recommendedTransactionFeeForAccount = () ->
    return 10000
    
  myWallet.recommendedTransactionFeeForAddress = () ->
    return 10000
        
  myWallet.archiveAccount = (account) ->
    return
  
  myWallet.unarchiveAccount = (account) ->
    return
    
  myWallet.isArchivedForAccount = (idx) ->
    accounts[idx].archived
    
  myWallet.makePairingCode = () ->
    return ""
    
  myWallet.addWatchOnlyLegacyAddress = (address) ->
    MyWalletStore.addLegacyAddress(address, null, 300000000)
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
    
  myWallet.recoverMyWalletHDWalletFromMnemonic = (mnemonic, pwd) ->
    accounts.splice(0,accounts.length)
    accounts.push({name: "Account #0", balance: 0})
    
  myWallet.getLabeledReceivingAddressesForAccount = () ->
    return []
        
  myWallet.getFiatAtTime = (time, value, currencyCode, successCallback, errorCallback) ->
    successCallback(3.2)
    
  myWallet.validateSecondPassword = (candidate) ->
    candidate != "wrong"
    
  ############################################################
  # Simulate spontanuous behavior when using mock in browser #
  ############################################################

    
  ###################################
  # Fake methods useful for testing #
  ###################################
  
  myWallet.sync = () ->
    MyWalletStore.setIsSynchronizedWithServer(false)
    
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
      cookie[myWallet.uid].notes = MyWalletStore.getNotes()
      cookie[myWallet.uid].legacyAddresses = MyWalletStore.getAllLegacyAddresses()
      
            
      localStorageService.set("mockWallets", cookie)
      MyWalletStore.setIsSynchronizedWithServer(true)
    ), 5000)
    
  
  myWallet.refresh = () ->
    accounts = angular.copy(localStorageService.get("mockWallets")[this.uid].accounts)
    MyWalletStore.setTransactions(angular.copy(localStorageService.get("mockWallets")[this.uid].transactions))
    MyWalletStore.setNotes(angular.copy(localStorageService.get("mockWallets")[this.uid].notes))
    for address, data of localStorageService.get("mockWallets")[this.uid].legacyAddresses
      MyWalletStore.addLegacyAddress(address, data.privateKey, data.balance, data.label, data.archived)
        
  # myWallet.setTwoFactorGoogleAuthenticator = (success, error) ->
  #   success("google_secret")
  #
  # myWallet.confirmTwoFactorGoogleAuthenticator = (code, success, error) ->
  #   if code == "123456"
  #     success()
  #   else
  #     error()
        
  myWallet.setSecondPassword = (password, success, error) ->
    success()
    
  myWallet.unsetSecondPassword = (success, error) ->
    success()
    
  myWallet.setPbkdf2Iterations = (pbkdf2_iterations, success) ->
    WalletStore.setPbkdf2Iterations(pbkdf2_iterations)
    success()
    
  myWallet.setUseBuildHDWalletWebworker = (value) ->
    
  myWallet.resendTwoFactorSms = (uid, success, error) ->
    success()
    
  myWallet.fetchMoreTransactionsForAccounts = (success, error, last) ->
    if shouldFetchOldestTransaction
      last()
      
    success([])
    return
    
  myWallet.fetchMoreTransactionsForAccount = (n, success, error, last) ->
    if shouldFetchOldestTransaction
      last()
    
    success([])
    return
    
  myWallet.fetchMoreTransactionsForLegacyAddresses = (success, error, last) ->
    if shouldFetchOldestTransaction
      last()
    
    success([])
    return
            
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
    
    MyWalletStore.sendEvent("on_tx")
    
  myWallet.mockProcessNewTransaction = (transaction) ->  
    
    # Match "to" address to receive address to figure out which account it was sent to:
    for account in accounts
      for address in account.receive_addresses
        if address == transaction.to
          index = accounts.indexOf(account)
          accounts[index].balance += transaction.result
          transaction.to = {account: {index: index, amount: transaction.result}, legacyAddresses: null, externalAddresses: null}
          
          MyWalletStore.appendTransaction(transaction)
          
          # Update the "blockchain" in our cookie:
          cookie = localStorageService.get("mockWallets")
          cookie[this.uid].accounts[index].balance += transaction.result
          cookie[this.uid].transactions.push transaction
          localStorageService.set("mockWallets", cookie)
          
          break

  myWallet.mockShouldReceiveNewBlock = () ->
    MyWalletStore.sendEvent("on_block")
    
  myWallet.mockShouldFetchOldestTransaction = () ->
    shouldFetchOldestTransaction = true
  
  return myWallet 