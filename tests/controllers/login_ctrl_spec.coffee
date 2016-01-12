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
     WalletNetwork = $injector.get("WalletNetwork")

     spyOn(WalletNetwork, "resendTwoFactorSms").and.callFake(()->
       {
         then: (callback) ->
           callback()
           {
             catch: (callback) ->
               if false
                 callback()
                 {
                 }
         }
       }
     )

     MyWallet = $injector.get("MyWallet")

     scope = $rootScope.$new()

     $controller "LoginCtrl",
       $scope: scope,
       $stateParams: {}
       $uibModal: modal

     return

   return

  it "should login",  inject((Wallet) ->
    scope.uid = "user"
    scope.password = "pass"

    spyOn(Wallet, "login")

    scope.login()

    return
  )

  it "should resend two factor sms", inject((Wallet, WalletNetwork) ->
    Wallet.settings.twoFactorMethod = 5
    scope.uid = "user"

    scope.resend()

    expect(WalletNetwork.resendTwoFactorSms).toHaveBeenCalled()
    expect(WalletNetwork.resendTwoFactorSms).toHaveBeenCalledWith("user")

    return
  )
