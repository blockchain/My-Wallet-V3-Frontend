describe "buyStatus service", () ->
  Wallet = undefined
  MyWallet = undefined
  Options = undefined

  beforeEach angular.mock.module("walletApp")

  beforeEach ->
    angular.mock.inject ($injector, _$rootScope_, _$q_) ->
      $rootScope = _$rootScope_
      $q = _$q_
      Wallet = $injector.get("Wallet")
      MyWallet = $injector.get("MyWallet")
      Options = $injector.get("Options")

      Options.get = () ->
        Promise.resolve({
          "showBuySellTab": ["US"],
          "partners": {
            "coinify": {
              "countries": ["US"]
            }
          }
        })

      MyWallet.wallet =
        accountInfo:
          countryCodeGuess: {}
        hdwallet:
          accounts: [{label: ""}, {label: "2nd account"}]
          defaultAccount: {index: 0}
