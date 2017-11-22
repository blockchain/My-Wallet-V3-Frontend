angular
  .module('walletApp')
  .controller('SendBitcoinCashController', SendBitcoinCashController);

function SendBitcoinCashController ($rootScope, $scope, AngularHelper, Env, MyWallet, Wallet, Alerts, currency, format) {
  let feePerByte;
  let enumify = (...ns) => ns.reduce((e, n, i) => angular.merge(e, {[n]: i}), {});

  $scope.transaction = {};

  $scope.steps = enumify('send-cash', 'send-confirm');
  $scope.onStep = (s) => $scope.steps[s] === $scope.step;
  $scope.goTo = (s) => $scope.step = $scope.steps[s];
  $scope.goTo('send-cash');

  $scope.originsLoaded = true;
  $scope.origins = MyWallet.wallet.bch.accounts;
  $scope.transaction.from = MyWallet.wallet.bch.defaultAccount;

  $scope.toSatoshi = currency.convertToSatoshi;
  $scope.fromSatoshi = currency.convertFromSatoshi;
  $scope.bchCurrency = currency.bchCurrencies[0];
  $scope.fiatCurrency = Wallet.settings.currency;
  $scope.isValidAddress = Wallet.isValidAddress;

  $scope.onAddressScan = (result) => {
    let address = Wallet.parsePaymentRequest(result);
    if (Wallet.isValidAddress(address.address)) {
      $scope.transaction.destination = format.destination(address, 'External')['address'];
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

  const transactionFailed = (error) => {
    Alerts.displayError(error.error || error.message);
  };

  $scope.send = () => {
    let tx = $scope.transaction;
    let payment = $scope.transaction.from.createPayment();

    $scope.lock();

    payment.to(tx.destination);
    payment.amount(tx.amount);
    payment.feePerByte(feePerByte);
    payment.build();

    const signAndPublish = (passphrase) => {
      return payment.sign(passphrase).publish();
    };

    Wallet.askForSecondPasswordIfNeeded().then(signAndPublish)
      .then(transactionSucceeded).catch(transactionFailed);
  };

  $scope.getTransactionTotal = (includeFee) => {
    let tx = $scope.transaction;
    let fee = includeFee ? tx.fee : 0;
    return parseInt(tx.amount, 10) + parseInt(fee, 10);
  };

  $scope.useAll = () => {
    $scope.transaction.amount = $scope.transaction.maxAvailable;
  };

  Env.then((res) => {
    feePerByte = res.bcash.feePerByte;

    $scope.setMax = () => {
      $scope.transaction.from.getAvailableBalance(feePerByte).then((balance) => {
        $scope.transaction.fee = balance.sweepFee;
        $scope.transaction.maxAvailable = balance.amount;
      }).catch((err) => {
        console.log(err);
        $scope.transaction.maxAvailable = 0;
      });
    };

    $scope.$watch('transaction.from', $scope.setMax);
  });

  AngularHelper.installLock.call($scope);
}
