angular
  .module('walletApp')
  .controller("SendCtrl", SendCtrl);

function SendCtrl($scope, $log, Wallet, Alerts, currency, $uibModalInstance, $timeout, $state, $filter, $stateParams, $translate, paymentRequest, filterFilter, $uibModal, format, MyWalletHelpers) {

  $scope.legacyAddresses = Wallet.legacyAddresses;
  $scope.accounts = Wallet.accounts;
  $scope.addressBook = Wallet.addressBook;

  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.alerts = [];

  $scope.origins = [];
  $scope.destinations = [];
  $scope.destinationsBase = [];
  $scope.originsLoaded = false;

  $scope.cameraIsOn = false;
  $scope.sending = false;
  $scope.amountIsValid = true;
  $scope.confirmationStep = false;
  $scope.advanced = false;

  $scope.fiatCurrency = Wallet.settings.currency;
  $scope.btcCurrency = Wallet.settings.btcCurrency;
  $scope.isBitCurrency = currency.isBitCurrency;

  $scope.transactionTemplate = {
    from: null,
    sweepAmount: null,
    destinations: [null],
    amounts: [null],
    fee: Wallet.settings.feePerKB,
    note: "",
    publicNote: false
  };

  $scope.payment = new Wallet.payment();
  $scope.transaction = angular.copy($scope.transactionTemplate);

  $scope.determineLabel = (origin) => origin.label || origin.address;
  $scope.hasZeroBalance = (origin) => origin.balance === 0.0;

  $scope.getFilter = (search, accounts=true) => ({
    label: search,
    type: accounts ? '!External' : 'Imported'
  });

  $scope.filterDestinations = (destinationsIdx, query) => {
    return $scope.destinations[destinationsIdx].filter(dest => {
      if (dest.type == "External" && dest.address == "") {
        return false;
      }
      if (!!dest.address && dest.address != "") {
        // If it's an address, match either address or label
        if(!dest.address.toLowerCase().includes(query.toLowerCase()) & !dest.label.toLowerCase().includes(query.toLowerCase())) {
          return false;
        }
      }
      // If it's an account, only match the label
      if (!!dest.label && dest.label != "" && !dest.label.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  $scope.onError = (error) => {
    $translate("CAMERA_PERMISSION_DENIED").then(translation => {
      Alerts.displayWarning(translation, false, $scope.alerts);
    });
  };

  $scope.applyPaymentRequest = (paymentRequest, i) => {
    $scope.processingPaymentRequest = true;
    let destination = {
      address: paymentRequest.address || "",
      label: paymentRequest.address || "",
      type: "External"
    };
    $scope.transaction.destinations[i] = destination;
    $scope.transaction.amounts[i] = paymentRequest.amount;
    $scope.transaction.note = paymentRequest.message || '';
    $scope.validateAmounts();
    $scope.updateToLabel();
    $scope.$$postDigest(() => {
      $timeout(() => {
        $scope.processingPaymentRequest = false;
      }, 3000);
    });
  };

  $scope.processURLfromQR = (url) => {
    paymentRequest = Wallet.parsePaymentRequest(url);
    if (paymentRequest.isValid) {
      $scope.applyPaymentRequest(paymentRequest, $scope.qrIndex);
      $scope.cameraOff();
    } else {
      $translate("QR_CODE_NOT_BITCOIN").then(translation => {
        Alerts.displayWarning(translation, false, $scope.alerts);
      });
      $log.error("Not a bitcoin QR code:" + url);
    }
  };

  $scope.cameraOn = (index=0) => {
    $scope.cameraRequested = true;
    $scope.qrIndex = index;
  };

  $scope.cameraOff = () => {
    $scope.cameraIsOn = false;
    $scope.cameraRequested = false;
    $scope.qrIndex = null;
    $scope.$broadcast("STOP_WEBCAM");
  };

  $scope.close = () => {
    Alerts.clear($scope.alerts);
    $uibModalInstance.dismiss("");
  };

  $scope.resetSendForm = () => {
    $scope.transaction = angular.copy($scope.transactionTemplate);
    $scope.transaction.from = Wallet.accounts()[Wallet.my.wallet.hdwallet.defaultAccountIndex];

    // Remove error messages:
    $scope.validateAmounts();
    $scope.sendForm.$setPristine();
    $scope.sendForm.$setUntouched();

    $scope.setPaymentFee();
  };

  $scope.addDestination = () => {
    let originalDestinations = angular.copy($scope.destinations[0]);
    $scope.destinations.push(originalDestinations);
    $scope.transaction.amounts.push(null);
    $scope.transaction.destinations.push(null);
  };

  $scope.removeDestination = (index) => {
    $scope.destinations.splice(index, 1);
    $scope.transaction.amounts.splice(index, 1);
    $scope.transaction.destinations.splice(index, 1);
  };

  $scope.numberOfActiveAccountsAndLegacyAddresses = () => {
    let numAccts = Wallet.accounts().filter(a => !a.archived).length;
    let numAddrs = Wallet.legacyAddresses().filter(a => !a.archived && !a.isWatchOnly).length;
    return numAccts + numAddrs;
  };

  $scope.send = () => {
    if ($scope.sending) return;

    $scope.sending = true;
    $scope.transaction.note = $scope.transaction.note.trim();

    Alerts.clear($scope.alerts);

    var note = $scope.transaction.publicNote ? $scope.transaction.note : null;
    $scope.payment.note(note);

    let paymentCheckpoint;
    const setCheckpoint = (payment) => {
      paymentCheckpoint = payment;
    };

    const transactionFailed = (message) => {
      $scope.sending = false;
      $scope.payment = new Wallet.payment(paymentCheckpoint).build();
      if (message) {
        $translate(message).then(t => {
          Alerts.displayError(t, false, $scope.alerts);
        });
      }
    };

    const transactionSucceeded = (tx) => {
      $scope.sending = false;
      $uibModalInstance.close("");
      Wallet.beep();

      let note = $scope.transaction.note;
      if (!$scope.transaction.publicNote && note !== "") {
        Wallet.setNote({ hash: tx.txid }, note);
      }

      let index = $scope.transaction.from.index;
      if(index === null || index == undefined)  {
        index = 'imported';
      }

      if (!($state.current.name === "wallet.common.transactions" || $stateParams.accountIndex === "")) {
        $state.go("wallet.common.transactions", {
          accountIndex: index
        });
      }

      Wallet.saveActivity(0);

      let message = 'BITCOIN_SENT';

      if(MyWalletHelpers.tor()) {
        message = 'BITCOIN_SENT_TOR';
      }

      $translate(message).then(translation => {
        Alerts.displaySentBitcoin(translation);
      });


    };

    const signAndPublish = (passphrase) => {
      return $scope.payment.sideEffect(setCheckpoint)
        .sign(passphrase).publish().payment;
    };

    Wallet.askForSecondPasswordIfNeeded().then(signAndPublish)
      .then(transactionSucceeded).catch(transactionFailed);
  };

  $scope.closeAlert = (alert) => {
    Alerts.close(alert);
  };

  $scope.updateToLabel = () => {
    let destinations = $scope.transaction.destinations.filter(d => d != null);
    if (destinations.length === 0) return;
    if ($scope.advanced && destinations.length > 1) {
      $scope.toLabel = destinations.length + ' Recipients';
    } else {
      let dest = destinations[0];
      $scope.toLabel = dest.index == null ?
        dest.label || dest.address : `${dest.label}`;
    }
  };

  $scope.getTransactionTotal = (includeFee) => {
    let tx = $scope.transaction;
    let fee = includeFee ? tx.fee : 0;
    return tx.amounts.reduce((previous, current) => {
      return (parseInt(previous) + parseInt(current)) || 0;
    }, parseInt(fee));
  };

  $scope.validateAmounts = () => {
    if ($scope.transaction.from == null) return;
    let available = $scope.getAvailableBalance();
    let transactionTotal = $scope.getTransactionTotal();
    $scope.amountIsValid = available - transactionTotal >= 0;
  };

  $scope.allAmountsAboveZero = () => {
    return $scope.transaction.amounts.every(amt => amt > 0);
  };

  $scope.checkForSameDestination = () => {
    const transaction = $scope.transaction;
    return transaction.destinations.forEach((dest, index) => {
      let match = false;
      if (dest != null) {
        match = dest.label === transaction.from.label;
      }
      if ($scope.sendForm == null) return;
      $scope.sendForm['destinations' + index].$setValidity('isNotEqual', !match);
    });
  };

  $scope.hasAmountError = (index) => {
    let field = $scope.sendForm['amounts' + index];
    let fieldFiat = $scope.sendForm['amountsFiat' + index];
    return ((!field ? false : field.$touched || fieldFiat.$touched) || index == null) && field.$invalid;
  };

  $scope.hasInsufficientError = (index) => {
    let field = $scope.sendForm['amounts' + index];
    let fieldFiat = $scope.sendForm['amountsFiat' + index];
    return ((!field ? false : field.$touched || fieldFiat.$touched) || index == null) && !$scope.amountIsValid;
  };

  $scope.getAvailableBalance = () => {
    let tx = $scope.transaction;
    if (!tx.from) return 0;
    let availableBal = tx.from.balance - tx.fee;
    let maxAvailable = ($scope.advanced ? availableBal : tx.sweepAmount) || availableBal;
    if (maxAvailable < 0) maxAvailable = 0;
    return maxAvailable;
  };

  $scope.$watch("transaction.destinations", (destinations) => {
    destinations.forEach((dest, index) => {
      if (dest == null) return;
      if (dest.type === 'Accounts' || (dest.index != null)) {
        $scope.sendForm['destinations' + index].$setValidity('isValidAddress', true);
      } else {
        let valid = Wallet.isValidAddress(dest.address);
        $scope.sendForm['destinations' + index].$setValidity('isValidAddress', valid);
      }
      $scope.updateToLabel();
      $scope.setPaymentTo();
    });
  }, true);

  $scope.$watch("status.didLoadBalances", () => {
    if ($scope.status.didLoadBalances) {
      if ($scope.origins.length === 0) {
        let defaultIdx = Wallet.my.wallet.hdwallet.defaultAccountIndex;
        let selectedIdx = parseInt($stateParams.accountIndex);
        let idx = isNaN(selectedIdx) ? defaultIdx : selectedIdx;
        for (let account of $scope.accounts()) {
          account = format.origin(account);
          if (account.index != null && !account.archived) {
            if (account.index === idx) {
              $scope.transaction.from = account;
            }
            $scope.origins.push(account);
            $scope.destinationsBase.push(angular.copy(account));
          }
        }
        for (let address of $scope.legacyAddresses()) {
          address = format.origin(address);
          if (!address.archived) {
            $scope.destinationsBase.push(address);
            if (!address.isWatchOnly) {
              $scope.origins.push(angular.copy(address));
            }
          }
        }
        $scope.destinationsBase.push({
          address: "",
          label: "",
          type: "External"
        });
        $scope.destinations.push($scope.destinationsBase);
        $scope.originsLoaded = true;
        if ((paymentRequest.address != null) && paymentRequest.address !== '') {
          $scope.applyPaymentRequest(paymentRequest, 0);
        } else if (paymentRequest.toAccount != null) {
          $scope.transaction.destinations[0] = format.origin(paymentRequest.toAccount);
          $scope.transaction.from = paymentRequest.fromAddress;
        } else if (paymentRequest.fromAccount != null) {
          $scope.transaction.from = paymentRequest.fromAccount;
        }
      }
      $scope.setPaymentFrom();
      $scope.setPaymentTo();
      $scope.setPaymentAmount();
    }
  });

  $scope.handleTxUpdate = (tx) => {
    if (tx.fee != null && tx.fee !== $scope.transaction.fee) {
      $scope.transaction.fee = tx.fee;
      $scope.$root.$safeApply($scope);
    }
    if (tx.sweepAmount != null && tx.sweepAmount !== $scope.transaction.sweepAmount) {
      $scope.transaction.sweepAmount = tx.sweepAmount;
      $scope.$root.$safeApply($scope);
    }
  };

  $scope.setAllAndBuild = () => {
    $scope.setPaymentFrom();
    $scope.setPaymentTo();
    $scope.setPaymentAmount();
    $scope.setPaymentFee();

    $scope.payment.buildbeta()
      .then((p) => {
        $scope.buildTx();
        return p;
      })
      .catch(response => {
        let msg = response.error.message || response.error;
        $scope.backToForm();
        Alerts.clear($scope.alerts);
        Alerts.displayError(msg, false, $scope.alerts);
        $scope.$root.$safeApply($scope);
        return response.payment;
      });
  };

  $scope.buildTx = () => {
    let valid = !$scope.sendForm.$invalid &&
                $scope.sendForm.$dirty &&
                $scope.amountIsValid;
    if (valid) {
      console.log("Build tx")

      $scope.payment.build()
        .sideEffect($scope.handleTxUpdate);
    }
  };

  $scope.setPaymentFrom = () => {
    let txFrom = $scope.transaction.from;
    if (!txFrom) return;
    let origin = (txFrom.index == null) ? txFrom.address : txFrom.index;
    $scope.payment.from(origin);
    $scope.buildTx();
  };

  $scope.setPaymentTo = () => {
    let destinations = $scope.transaction.destinations;
    if (destinations.some(d => d == null)) return;
    destinations = destinations.map(d => d.type === 'Accounts' ? d.index : d.address);
    $scope.payment.to(destinations);
    $scope.buildTx();
  };

  $scope.setPaymentAmount = () => {
    $scope.payment.amount($scope.transaction.amounts)
    $scope.buildTx();
  };

  $scope.setPaymentFee = () => {
    let fee = ($scope.advanced) ? $scope.transaction.fee : null;
    $scope.payment.fee(fee);
    $scope.buildTx();
  };

  $scope.goToConfirmation = () => {
    $scope.confirmationStep = true;
  };

  $scope.backToForm = () => {
    $scope.confirmationStep = false;
  };

  $scope.advancedSend = () => {
    $scope.advanced = true;
    $scope.setPaymentFee();
  };

  $scope.regularSend = () => {
    $scope.transaction.destinations.splice(1);
    $scope.transaction.amounts.splice(1);
    $scope.advanced = false;
    $scope.setPaymentFee();
  };

}
