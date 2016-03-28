describe "LoginCtrl", ->
  scope = undefined
  Alerts = undefined

  modal =
   open: (args) ->
     result:
       then: ->

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
   angular.mock.inject ($injector, $rootScope, $controller) ->
     Wallet = $injector.get("Wallet")
     WalletNetwork = $injector.get("WalletNetwork")
     Alerts = $injector.get("Alerts")

     spyOn(WalletNetwork, "resendTwoFactorSms").and.callThrough()

     MyWallet = $injector.get("MyWallet")

     $rootScope.loginFormUID = {
       then: (cb) ->
         cb("1234")
         {
           catch: () ->
         }
     }

     scope = $rootScope.$new()

     $controller "LoginCtrl",
       $scope: scope,
       $stateParams: {}
       $uibModal: modal

  it "should login",  inject((Wallet) ->
    scope.uid = "user"
    scope.password = "pass"

    spyOn(Wallet, "login")

    scope.login()
  )

  it "should resend two factor sms", inject((Wallet, WalletNetwork) ->
    Wallet.settings.twoFactorMethod = 5
    scope.sessionToken = "token"
    scope.uid = "user"

    scope.resend()

    expect(WalletNetwork.resendTwoFactorSms).toHaveBeenCalled()
    expect(WalletNetwork.resendTwoFactorSms).toHaveBeenCalledWith("user", "token")
  )
