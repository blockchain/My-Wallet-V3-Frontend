angular
  .module('walletApp')
  .controller('CoinifyMediumController', CoinifyMediumController);

function CoinifyMediumController ($scope, $timeout, Alerts, buySell) {
  $scope.installLock();
  $scope.$timeout = $timeout;
  $scope.limits = buySell.limits;
  let { quote, baseFiat, fiatCurrency } = $scope.vm;

  let fiatAmount = baseFiat() ? -quote.baseAmount / 100 : -quote.quoteAmount / 100;
  $scope.belowCardMax = fiatAmount < parseFloat($scope.limits.card.max[fiatCurrency()]);
  // i.e card max is 300 and buy amount is 500
  // $scope.belowCardMax = false;
  $scope.aboveBankMin = fiatAmount > parseFloat($scope.limits.bank.min[fiatCurrency()]);
  // i.e bank min is 50 and buy amount is 30
  // $scope.aboveBankMin = false;

  $scope.vm.medium = $scope.belowCardMax ? 'card' : 'bank';

  $scope.submit = () => {
    $scope.lock();
    let { medium, quote } = $scope.vm;

    // cache accounts in My-Wallet-V3 instead
    quote.getPaymentMediums()
         .then((mediums) => mediums[medium].getAccounts())
         .then((accounts) => buySell.accounts = accounts)
         .then(() => $scope.vm.goTo('summary'))
         .then($scope.free).catch((err) => console.log(err));
  };

  $scope.lock();

  quote.getPaymentMediums()
       .then((mediums) => $scope.mediums = mediums)
       .then($scope.free).catch((err) => console.log(err));
}
