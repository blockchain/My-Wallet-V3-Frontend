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
walletServices.factory "Wallet", ($log, $window, $timeout, MyWallet, $rootScope, ngAudio) ->
  wallet = {status: {isLoggedIn: false}, totals: {}, language: null, settings: {}}
  
  wallet.addresses    = []
  wallet.transactions = []
  
  
  ##################################
  #             Public             #
  ##################################
  
  wallet.login = (uid, password) ->    
    $window.root = "https://blockchain.info/"
    wallet.my = MyWallet
    
    
    
    wallet.my.setGUID(uid)
    # setGUID is asynchronous, temporary workaround:
    $timeout((->
      wallet.my.restoreWallet(password)
      wallet.status.isLoggedIn = true
      
      wallet.settings.language = wallet.my.getLanguage()
      wallet.settings.currency = $window.symbol_local
      
      wallet.updateAddresses()
      


      # getTransactions needs to be called after some asynchronous event
      $timeout((->
        wallet.updateTransactions()
        ), 500)
       
      ), 500)    
        
    wallet.generateAddress = () ->
      wallet.my.generateNewKey()
      wallet.updateAddresses()
      
    wallet.logout = () ->
      wallet.my = null
      wallet.status.isLoggedIn = false
      while wallet.addresses.length > 0
        wallet.addresses.pop()
    
    ##################################
    #             Private            #
    ##################################
    
    wallet.updateAddresses = () ->
      for activeAddress in wallet.my.getActiveAddresses()
        match = false
        for address in wallet.addresses
          if address.address == activeAddress
            match = true
          
        if !match
          wallet.addresses.push {address: activeAddress, active: true, balance: null, name: (wallet.my.getAddressLabel(activeAddress) || activeAddress.substring(0,15))}
 
      
    wallet.updateTransactions = () ->
      for tx in wallet.my.getTransactions()
        match = false
        for candidate in wallet.transactions
          if candidate.hash == tx.hash
            match = true
            break
        
        if !match
          transaction = wallet.my.parseTransaction(tx)
          transaction.fiat = transaction.result / wallet.settings.currency.conversion
          wallet.transactions.push transaction 
      
      # Update address balances:
      tally = 0.0
      for address in wallet.addresses
        address.balance = wallet.my.getAddressBalance(address.address)
        tally = tally + address.balance
      
      wallet.totals.btc = tally
      wallet.totals.fiat  = tally / wallet.settings.currency.conversion
      
    wallet.send = (to, amount, observer) ->
      if observer == undefined || observer == null
        console.error "An observer is required"
        return
        
      if observer.transactionDidFailWithError == undefined
        console.error "Observer should implement transactionDidFailWithError"
        return
        
      if observer.transactionDidFinish == undefined
        console.error "Observer should implement transactionDidFinish"
        return
        
      listener = {}
      listener.on_error = (e) ->
        if e.message != undefined
          observer.transactionDidFailWithError(e.message)
        else if e isnt null
          observer.transactionDidFailWithError(e)
          $rootScope.$apply()
        else
          observer.transactionDidFailWithError("Unknown error")
          $rootScope.$apply()
        
      listener.on_start = () ->
        return
      
      listener.on_begin_signing = () ->
        return
        
      listener.on_sign_progress = () ->
        return

      listener.on_finish_signing = () ->
        return

      listener.on_before_send = () ->
        return
        
      listener.on_success = () ->
        observer.transactionDidFinish()
      
      wallet.my.quickSendNoUI(to, amount, listener)
    
    # The old monitoring system
    wallet.monitorLegacy = (event) ->
      console.log "Received: " + event
      if event == "on_tx" or event == "on_block"
        before = wallet.transactions.length
        wallet.updateTransactions()
        if wallet.transactions.length > before
          sound = ngAudio.load("beep.wav")
          sound.play()
    
    # The new monitoring system  
    wallet.monitor = (event) ->
      console.log event

      
    wallet.my.monitor((event) -> wallet.monitor(event))
    wallet.my.addEventListener((event) -> wallet.monitorLegacy(event))
    

    ########################################
    # Testing: only works on mock MyWallet #
    ########################################
    
    wallet.refresh = () ->
      wallet.my.refresh()
      wallet.updateAddresses()
      wallet.updateTransactions()
            
  return  wallet
