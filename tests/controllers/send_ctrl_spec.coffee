describe "SendCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("test", "test")  
      
      scope = $rootScope.$new()
                  
      $controller "SendCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
        paymentRequest: {address: "", amount: ""}
        
      scope.transaction = {
        to: "1DDBEYPPTkgbctmMtH3gXc7UHFURw5HGJD"
        amount: "0.2"
        currency: "BTC"
      }
      scope.$apply()
      
      scope.qrStream = {}
      scope.qrStream.stop = () ->
        return
      
      return

    return
    
  it "should exist",  inject(() ->
    expect(scope.close).toBeDefined() 
  
    return
  )
  
  it "should have access to address book",  inject(() ->
    expect(scope.addressBook).toBeDefined()
    expect(scope.addressBook["17gJCBiPBwY5x43DZMH3UJ7btHZs6oPAGq"]).toBe("John")
    
  )
  
  it "should have access to accounts",  inject(() ->
    expect(scope.accounts).toBeDefined()
    expect(scope.accounts.length).toBeGreaterThan(0)
    
  )
  
  # Form validation: should be refactored to move transaction into a service

  it "should enable Send button if transaction is valid",  inject(() ->
    expect(scope.transactionIsValid).toBe(true)
    
    return
  )
  
  it "should show account transactions after send",  inject(($state) ->
    spyOn($state, "go")
    
    scope.transaction.from = scope.accounts[1]
    
    scope.send()
    
    expect($state.go).toHaveBeenCalledWith('transactions', { accountIndex: 1 })
    
  )
  
  describe "to address", ->
  
    it "should disable Send button if To address missing",  inject(() ->
      scope.transaction.to = ""
      scope.$apply()
    
      expect(scope.transactionIsValid).toBe(false)
    
      scope.transaction.to = undefined
      scope.$apply()
    
      expect(scope.transactionIsValid).toBe(false)
    
      scope.transaction.to = null
      scope.$apply()
    
      expect(scope.transactionIsValid).toBe(false)
    
      return
    )
  
    it "should disable Send button if To address is invalid",  inject(() ->
      scope.transaction.to = "invalid address" 
      scope.$apply()
    
      expect(scope.transactionIsValid).toBe(false)
    
      return
    )
    
    return
    
  describe "to email", ->
    beforeEach ->
      scope.transaction.to = "nic@blockchain.info"
      scope.method = "EMAIL"
      scope.$apply()
      
    it "should be valid", ->
      expect(scope.transactionIsValid).toBe(true)
      
    it "should disable Send button if email is missing",  inject(() ->
      scope.transaction.to = ""
      scope.$apply()
    
      expect(scope.transactionIsValid).toBe(false)
    
      scope.transaction.to = undefined
      scope.$apply()
    
      expect(scope.transactionIsValid).toBe(false)
    
      scope.transaction.to = null
      scope.$apply()
    
      expect(scope.transactionIsValid).toBe(false)
    
      return
    )
  
    it "should disable Send button if email address is invalid",  inject(() ->
      scope.transaction.to = "bla.nl" 
      scope.$apply()
    
      expect(scope.transactionIsValid).toBe(false)
    
      return
    )
    
    it "should call Wallet.sendToEmail() when Send is pressed",  inject((Wallet) ->
      spyOn(Wallet,"sendToEmail")
    
      scope.send()
    
      expect(Wallet.sendToEmail).toHaveBeenCalled()
    
      return
    )
    
    return

  it "should disable Send button if amount is missing",  inject(() ->
    scope.transaction.amount = ""
    scope.$apply()
    expect(scope.transactionIsValid).toBe(false)
    
    return
  )
  
  it "should disable Send button if amount is zero",  inject(() ->
    scope.transaction.amount = "0.0"
    scope.$apply()
    expect(scope.transactionIsValid).toBe(false)    
    return
  )
  
  it "should enable Send button if balance is not too low ",  inject(() ->
    scope.transaction.amount = "1" # Less than what the mock account has.
    scope.$apply()
    expect(scope.transactionIsValid).toBe(true)        
    return
  )
  
  
  it "should disable Send button if balance is too low (ex mining fee)",  inject(() ->
    scope.transaction.amount = "10.0" # Much more than what the mock account has.
    scope.$apply()
    expect(scope.transactionIsValid).toBe(false)        
    return
  )
  
  
  it "should call Wallet.send() when Send is pressed",  inject((Wallet) ->
    spyOn(Wallet,"send")
    
    scope.send()
    
    expect(Wallet.send).toHaveBeenCalled()
    
    return
  )
  
  it "should disable Close button when sending process starts",  inject(() ->
    # Listen for "on_start"
    pending()
    
    return
  )
  
  it "should enable Close button when sending process fails",  inject(() ->
    # Listen for "on_error"
    pending()
    
    return
  )
  
  it "should close the modal when sending process succeeds",  inject(() ->
    spyOn(modalInstance, "close")
    
    scope.send()
      
    expect(modalInstance.close).toHaveBeenCalled()
    
    return
  )
  
  it "should beep when sending process succeeds",  inject(() ->
    pending()
    
    return
  )
  
  it "should show error message if send() fails",  inject((Wallet) ->
    scope.transaction.amount = "3000000000" # Way too much
    
    scope.send()
    
    expect(scope.alerts.length).toBe(1)
    expect(scope.alerts[0].type).toBe("danger")
    
    return
  )
    
  it "should process a succesfully scanned QR code", inject((Wallet) ->
    scope.processURLfromQR("bitcoin://abcdefgh?amount=0.001")
    expect(scope.transaction.amount).toBe("0.001")
    expect(scope.transaction.to).toBe("abcdefgh") 
  )
  
  it "should warn user if QR code is not recognized", inject((Wallet) ->
    expect(scope.alerts.length).toBe(0)
    scope.processURLfromQR("http://www.google.com")
    expect(scope.alerts.length).toBe(1)
    
  )
  
  it "should enable Send button if fiat balance is sufficient",  inject(() ->
    scope.transaction.amount = "10"
    scope.transaction.currency = "EUR"
    scope.$apply()
    expect(scope.transactionIsValid).toBe(true)        
    return
  )
  
  it "should disable Send button if fiat balance is too low",  inject(() ->
    scope.transaction.amount = "50000" # Much more than what the mock account has.
    scope.transaction.currency = "EUR"
    scope.$apply()
    expect(scope.transactionIsValid).toBe(false)        
    return
  )
  
  it "overview should show friendly name for From", ->
    expect(scope.from).toBe("Savings Account")
  
  describe "internal", ->
    beforeEach ->
      scope.internal = true
      scope.to = ""
      scope.$apply()
      
    it "selects the next available account by default", ->
      expect(scope.transaction.toAccount).toBe(scope.accounts[1])
    
    it "does not require a to address", ->
      expect(scope.transactionIsValid).toBe(true)

    it "does not allow sending to the same account", ->
      scope.transaction.toAccount = scope.transaction.from
      scope.$apply()
      expect(scope.transactionIsValid).toBe(false)
      
    it "overview should show friendly name for From", ->
      expect(scope.from).toBe("Savings Account")
  
    it "overview should show friendly name for To", ->
      expect(scope.toLabel).toBe("Mobile Account")
      
    it "should call Wallet.sendInternal() when Send is pressed",  inject((Wallet) ->
      spyOn(Wallet,"sendInternal")
    
      scope.send()
    
      expect(Wallet.sendInternal).toHaveBeenCalled()
    
      return
    )
  