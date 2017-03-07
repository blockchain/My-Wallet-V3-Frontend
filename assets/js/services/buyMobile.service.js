/* eslint-disable semi */
angular
  .module('walletApp')
  .factory('buyMobile', buyMobile)

function buyMobile ($rootScope, $window, $state, $timeout, $q, Wallet, MyWallet, Options) {
  const actions = {
    FRONTEND_INITIALIZED: 'frontendInitialized',
    BUY_COMPLETED: 'buyCompleted',
    AMOUNT_FIELD_FOCUSED: 'amountFieldFocused',
    AMOUNT_FIELD_BLURRED: 'amountFieldBlurred',
    AMOUNT_FIELD_CHANGED: 'amountFieldChanged'
  }

  const service = Object.assign({}, actions)

  let prepMobileBuy = () => {
    $state.go('intermediate')
    $rootScope.inMobileBuy = true
  }

  let toBuySell = () => {
    $state.go('wallet.common.buy-sell')
  }

  $window.activateMobileBuy = (guid, sharedKey, password) => {
    if (Wallet.status.isLoggedIn) return false
    prepMobileBuy()
    Options.get()
      .then(() => $q(resolve => Wallet.login(guid, password, null, null, resolve, null, sharedKey)))
      .then(toBuySell)
  }

  $window.activateMobileBuyFromJson = (json, externalJson, magicHash, password) => {
    if (Wallet.status.isLoggedIn) return false
    prepMobileBuy()
    Options.get()
      .then(() => { MyWallet.loginFromJSON(json, externalJson, magicHash, password) })
      .then(() => $q(resolve => { Wallet.didLogin(MyWallet.wallet.guid, resolve) }))
      .then(toBuySell)
  }

  $window.teardown = () => {
    $state.go('intermediate')
    $timeout(() => MyWallet.logout(true))
  }

  $window.inputForAmountField = (input, fieldName) => {
    $rootScope.$broadcast('nativeKeyboardInput', parseFloat(input), fieldName)
  }

  service.callMobileInterface = (handlerName, value = null) => {
    if ($window.webkit) {
      let handler = $window.webkit.messageHandlers[handlerName]
      if (handler) handler.postMessage(value)
      else console.error('Unknown webkit handler: ' + handlerName)
    }
    if ($window.android) {
      let handler = $window.android[handlerName]
      if (handler) handler.call($window.android)
      else console.error('Unknown android handler: ' + handlerName)
    }
  }

  return service
}
