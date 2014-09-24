"use strict"

# Services 
walletServices = angular.module("walletServices", [])
walletServices.factory "Wallet", ($log, $window, $timeout) ->
  wallet = {status: {isLoggedIn: false}}
  
  wallet.addresses = []
  
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
    
    wallet.updateAddresses = () ->
      for address in wallet.my.getActiveAddresses()
        wallet.addresses.push {address: address, active: true}
              
  return  wallet
