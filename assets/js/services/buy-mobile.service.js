/* eslint-disable semi */
angular
  .module('walletApp')
  .factory('buyMobile', buyMobile)

function buyMobile ($rootScope, $window, $state, $timeout, $q, Wallet, MyWallet, Env) {
  const actions = {
    FRONTEND_INITIALIZED: 'frontendInitialized',
    BUY_COMPLETED: 'buyCompleted',
    SHOW_TX: 'showTx',
    COMPLETED_TRADE: 'completedTrade'
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
    Env
      .then(() => $q(resolve => Wallet.login(guid, password, null, null, resolve, null, sharedKey)))
      .then(toBuySell)
  }

  $window.activateMobileBuyFromJson = (json, externalJson, magicHash, password, firstLogin) => {
    if (Wallet.status.isLoggedIn) return false
    Wallet.goal.firstLogin = Boolean(firstLogin);
    prepMobileBuy()
    Env
      .then(() => MyWallet.loginFromJSON(json, externalJson, magicHash, password))
      .then(() => $q(resolve => { Wallet.didLogin(MyWallet.wallet.guid, resolve) }))
      .then(toBuySell)
  }

  $window.teardown = () => {
    $state.go('intermediate')
    $timeout(() => MyWallet.logout(true))
  }

  $window.checkForCompletedTrades = (json, externalJson, magicHash, password) => {
    MyWallet.checkForCompletedTrades(json, externalJson, magicHash, password, (trade) => {
      service.callMobileInterface(actions.COMPLETED_TRADE, trade.txHash)
    })
  }

  service.callMobileInterface = (handlerName, value) => {
    if ($window.webkit) {
      let handler = $window.webkit.messageHandlers[handlerName]
      if (handler) handler.postMessage(value)
      else console.error('Unknown webkit handler: ' + handlerName)
    }
    if ($window.android) {
      let handler = $window.android[handlerName]
      if (handler) value ? handler.call($window.android, value) : handler.call($window.android)
      else console.error('Unknown android handler: ' + handlerName)
    }
  }

  return service
}
