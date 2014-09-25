"use strict"

# Services 
walletServices = angular.module("walletServices", [])
walletServices.factory "Wallet", ($log, $window, $timeout) ->
  wallet = {status: {isLoggedIn: false}, totals: {}}
  
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
      
      wallet.updateAddresses()
      
      # Debug:
      # $log.info wallet.my.getLanguage()
      # $log.info $window.symbol_local
      
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
          wallet.addresses.push {address: activeAddress, active: true, balance: 100.00, name: "My " + activeAddress.substring(0,15)}
      
      tally = 0.0
      for address in wallet.addresses
        tally = tally + address.balance
      
      
      wallet.totals.fiat = tally
      wallet.totals.btc  = tally / 3.0
      
    wallet.updateTransactions = () ->
      for tx in wallet.my.getTransactions()
        transaction = wallet.my.parseTransaction(tx)
        transaction.fiat = transaction.result / 30000.0
        wallet.transactions.push transaction 
      
      $log.info wallet.transactions
      
  return  wallet
