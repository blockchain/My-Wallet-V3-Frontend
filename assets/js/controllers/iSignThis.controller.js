angular
  .module('walletApp')
  .controller('iSignThisCtrl', iSignThisCtrl);

function iSignThisCtrl ($rootScope, $scope, iSignThisProps, $uibModal, $uibModalInstance, $uibModalStack, Alerts, MyWallet, Wallet, trade, currency) {
  $scope.settings = Wallet.settings;
  $scope.profile = MyWallet.wallet.profile;
  $scope.fiatCurrency = Wallet.settings.currency;
  $scope.exchange = MyWallet.wallet.external.coinify;

  if (iSignThisProps) {
    $scope.transaction = {fiat: iSignThisProps.transaction.total};
    $scope.partner = iSignThisProps.partner;
    $scope.method = iSignThisProps.method;
    $scope.trades = iSignThisProps.trades;
    $scope.quote = iSignThisProps.quote;
    $scope.trade = iSignThisProps.trade;
    $scope.userHasExchangeAcct = $scope.trades.length > 0;
  } else {
    $scope.trade = trade;
    $scope.userHasExchangeAcct = true;
    $scope.method = {name: trade.medium};
  }

  $scope.receiveAddress = $scope.trade._receiveAddress;
  $scope.showReceiveAddress = $rootScope.rootURL && $rootScope.rootURL !== '/';

  $scope.step = 5;

  $scope.close = (all) => {
    Alerts.confirm('ARE_YOU_SURE_CANCEL', {}, '', 'IM_DONE').then(() => {
      all ? $uibModalStack.dismissAll() : $uibModalInstance.dismiss('');
      $rootScope.$broadcast('initExchangeAcct');
    });
  };

  $scope.$watch('fiatCurrency', () => {
    let curr = $scope.fiatCurrency || null;
    $scope.currencySymbol = currency.conversions[curr.code];
  });
}
