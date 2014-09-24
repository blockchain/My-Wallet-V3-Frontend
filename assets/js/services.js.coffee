"use strict"

# Services 
walletServices = angular.module("walletServices", [])
walletServices.factory "Wallet", ($log, $window, $timeout) ->
  wallet = {status: {isLoggedIn: false}}
  
  wallet.addresses = []
  
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
      ), 500
    )    
    
    wallet.generateAddress = () ->
      wallet.my.generateNewKey()
      wallet.updateAddresses()
    
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
          wallet.addresses.push {address: activeAddress, active: true}
              
  return  wallet
