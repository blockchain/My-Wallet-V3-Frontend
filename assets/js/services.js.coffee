"use strict"

# Services 
walletServices = angular.module("walletServices", [])
walletServices.factory "Wallet", ($log, $window, $timeout, MyWallet) ->
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
            
  return  wallet
