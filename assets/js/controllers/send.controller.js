angular
  .module('walletApp')
  .controller("SendCtrl", SendCtrl);

function SendCtrl($scope, $log, Wallet, Alerts, $uibModalInstance, $timeout, $state, $filter, $stateParams, $translate, paymentRequest, filterFilter, $uibModal) {

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
  $scope.isBitCurrency = Wallet.isBitCurrency;

  $scope.transactionTemplate = {
    from: null,
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

    if ($scope.transaction.publicNote) {
      $scope.payment.note($scope.transaction.note);
    }

    const transactionFailed = (message) => {
      $scope.sending = false;
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

      $translate(['SUCCESS', 'BITCOIN_SENT']).then(translations => {
        $scope.$emit('showNotification', {
          type: 'sent-bitcoin',
          icon: 'bc-icon-send',
          heading: translations.SUCCESS,
          msg: translations.BITCOIN_SENT
        });
      });

    };

    const signAndPublish = (passphrase) => {
      return $scope.payment.sign(passphrase).publish().payment;
    };

    Wallet.askForSecondPasswordIfNeeded().then(signAndPublish)
      .then(transactionSucceeded).catch(transactionFailed);
  };

  $scope.closeAlert = (alert) => {
    Alerts.close(alert);
  };

  $scope.allowedDecimals = (currency) => {
    if (Wallet.isBitCurrency(currency)) {
      if (currency.code === 'BTC') return 8;
      if (currency.code === 'mBTC') return 6;
      if (currency.code === 'bits') return 4;
    }
    return 2;
  };

  $scope.decimalPlaces = (number) => {
    return (number.toString().split('.')[1] || []).length;
  };

  $scope.updateToLabel = () => {
    let destinations = $scope.transaction.destinations.filter(d => d != null);
    if (destinations.length === 0) return;
    if ($scope.advanced && destinations.length > 1) {
      $scope.toLabel = destinations.length + ' Recipients';
    } else {
      let dest = destinations[0];
      $scope.toLabel = dest.index == null ?
        dest.label || dest.address : `${dest.label} Account`;
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
    let available = $scope.transaction.from.balance;
    let transactionTotal = $scope.getTransactionTotal(true);
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

  $scope.formatOrigin = (origin) => {
    const formatted = {
      label: origin.label || origin.address,
      index: origin.index,
      address: origin.address,
      balance: origin.balance,
      archived: origin.archived
    };
    formatted.type = origin.index != null ? 'Accounts' : 'Imported Addresses';
    if (origin.index == null) formatted.isWatchOnly = origin.isWatchOnly;
    return formatted;
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
        let idx = Wallet.my.wallet.hdwallet.defaultAccountIndex;
        if (!isNaN($stateParams.accountIndex)) {
          idx = parseInt($stateParams.accountIndex);
        }
        for (let account of $scope.accounts()) {
          account = $scope.formatOrigin(account);
          if (!((account.index != null) && account.archived)) {
            if (account.index === idx) {
              $scope.transaction.from = account;
            }
            $scope.origins.push(account);
            $scope.destinationsBase.push(angular.copy(account));
          }
        }
        for (let address of $scope.legacyAddresses()) {
          address = $scope.formatOrigin(address);
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
          $scope.transaction.destinations[0] = $scope.formatOrigin(paymentRequest.toAccount);
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
  };

  $scope.setAllAndBuild = () => {
    $scope.setPaymentFrom();
    $scope.setPaymentTo();
    $scope.setPaymentAmount();
    $scope.setPaymentFee();
    angular.copy($scope.payment)
      .buildbeta()
      .then($scope.buildTx)
      .catch(response => {
        let msg = response.error.message || response.error;
        $scope.backToForm();
        Alerts.displayError(msg, false, $scope.alerts);
        $scope.$root.$safeApply($scope);
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
