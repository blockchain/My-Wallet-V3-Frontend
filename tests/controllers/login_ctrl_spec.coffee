describe "LoginCtrl", ->
  scope = undefined

  modal =
   open: (args) ->  
     result:
       then: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
   angular.mock.inject ($injector, $rootScope, $controller) ->
     Wallet = $injector.get("Wallet")
     MyWallet = $injector.get("MyWallet")    
  
     scope = $rootScope.$new()
        
     $controller "LoginCtrl",
       $scope: scope,
       $stateParams: {}
       $modal: modal
  
     return

   return
   
  it "should login",  inject((Wallet) ->
    scope.uid = "user"
    scope.password = "pass"
        
    spyOn(Wallet, "login")
    
    scope.login()
    
    expect(Wallet.login).toHaveBeenCalled()
    return
  )

  it "should resend two factor sms", inject((Wallet) ->
    Wallet.settings.twoFactorMethod = 5
    
    spyOn(Wallet, "resendTwoFactorSms")

    scope.resend()

    expect(Wallet.resendTwoFactorSms).toHaveBeenCalled()
    return
  )