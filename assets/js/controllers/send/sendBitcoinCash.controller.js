angular
  .module('walletApp')
  .controller('SendBitcoinCashController', SendBitcoinCashController);

function SendBitcoinCashController ($rootScope, $scope, AngularHelper, Env, MyWallet, Wallet, Alerts, currency, format) {
  let feePerByte;
  let bch = MyWallet.wallet.bch;
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  Env.then((res) => {
    feePerByte = res.bcash.feePerByte;

    $scope.wallet.getAvailableBalance(feePerByte).then((balance) => {
      $scope.transaction.amount = balance.amount;
      $scope.transaction.fee = balance.sweepFee;
    });
  });

  $scope.steps = enumify('send-cash', 'send-address', 'send-confirm');
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => $scope.step = $scope.steps[s];
  $scope.goTo('send-cash');

  $scope.isValidAddress = Wallet.isValidAddress;
  $scope.wallet = bch.accounts[$scope.vm.asset.index];

  $scope.transaction = {};
  $scope.fromSatoshi = currency.convertFromSatoshi;
  $scope.bchCurrency = currency.bchCurrencies[0];
  $scope.fiatCurrency = Wallet.settings.currency;

  $scope.onAddressScan = (result) => {
    let address = Wallet.parsePaymentRequest(result);
    if (Wallet.isValidAddress(address.address)) {
      $scope.transaction.destination = format.destination(address, 'External');
    } else {
      throw new Error('BITCOIN_ADDRESS_INVALID');
    }
  };

  const transactionSucceeded = (tx) => {
    $rootScope.scheduleRefresh();
    $scope.free();
    Wallet.beep();
    Alerts.displaySentBitcoin('BITCOIN_CASH_SENT');
    $scope.vm.close();
  };

  const transactionFailed = (err) => {
    Alerts.displayError(err);
  };

  $scope.send = () => {
    let tx = $scope.transaction;
    let payment = bch.createPayment();

    $scope.lock();

    payment.from($scope.vm.asset.index);
    payment.to(tx.destination);
    payment.amount(tx.amount);
    payment.feePerByte(feePerByte);
    payment.build();

    const signAndPublish = (passphrase) => {
      return payment.sign(passphrase).publish().payment;
    };

    Wallet.askForSecondPasswordIfNeeded().then(signAndPublish)
      .then(transactionSucceeded).catch(transactionFailed);
  };

  AngularHelper.installLock.call($scope);
}
