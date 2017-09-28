angular
  .module('walletApp')
  .controller('SendBitcoinCashController', SendBitcoinCashController);

function SendBitcoinCashController ($scope, MyWallet, Wallet, currency, format) {
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  $scope.steps = enumify('send-cash', 'send-address', 'send-confirm');
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => $scope.step = $scope.steps[s];
  $scope.goTo('send-cash');

  $scope.transaction = { from: { label: 'My Bitcoin Cash Wallet' } };

  $scope.isValidAddress = Wallet.isValidAddress;
  $scope.wallet = MyWallet.wallet.hdwallet.accounts[$scope.vm.asset.index];

  $scope.bchCurrency = currency.bchCurrencies[0];
  $scope.fiatCurrency = Wallet.settings.currency;
  $scope.transaction.amount = currency.convertFromSatoshi($scope.wallet.balance, $scope.bchCurrency);
  $scope.transaction.fee = 0.000321; // TODO remove placeholder

  $scope.onAddressScan = (result) => {
    let address = Wallet.parsePaymentRequest(result);
    console.log('onAddressScan', address);
    if (Wallet.isValidAddress(address.address)) {
      $scope.transaction.destination = format.destination(address, 'External');
    } else {
      throw new Error('BITCOIN_ADDRESS_INVALID');
    }
  };

  $scope.send = () => {
    console.log('send', $scope.transaction);
  };
  console.log('send bch ctrl', $scope);
}
