describe "SendCtrl", ->
  scope = undefined
  modalInstance =
    close: ->
    dismiss: ->
  
  beforeEach angular.mock.module("walletApp")
  
  beforeEach ->
    angular.mock.inject ($injector, $timeout, $rootScope, $controller) ->
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      
      Wallet.login("uid", "pwd")  
      $timeout.flush()
      $timeout.flush()
      
      scope = $rootScope.$new()
                  
      $controller "SendCtrl",
        $scope: scope,
        $stateParams: {},
        $modalInstance: modalInstance
        
      scope.transaction.to = "1DDBEYPPTkgbctmMtH3gXc7UHFURw5HGJD"
      scope.$apply()
      
      return

    return
    
  it "should exist",  inject(() ->
    expect(scope.close).toBeDefined() 
  
    return
  )
  
  # Form validation: should be refactored to move transaction into a service

  it "should enable Send button if transaction is valid",  inject(() ->
    expect(scope.transactionIsValid).toBe(true)
    
    return
  )
  
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
    pending()
    
    scope.transaction.to = "1AAAA" 
    scope.$apply()
    
    expect(scope.transactionIsValid).toBe(false)
    
    return
  )

  it "should disable Send button if amount is missing",  inject(() ->
    pending()
    
    return
  )
  
  it "should disable Send button if amount is zero",  inject(() ->
    pending()
    
    return
  )
  
  it "should disable Send button if balance is too low",  inject(() ->
    pending()
    
    return
  )
  
  
  it "should call Wallet.send() when Send is pressed",  inject((Wallet) ->
    spyOn(Wallet,"send")
    
    scope.send()
    
    expect(Wallet.send).toHaveBeenCalledWith(scope.transaction.to, scope.transaction.amount, scope.observer)
    
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
    scope.transaction.amount = 3000000000 # Way too much
    
    scope.send()
    
    expect(scope.alerts.length).toBe(1)
    expect(scope.alerts[0].type).toBe("danger")
    
    return
  )