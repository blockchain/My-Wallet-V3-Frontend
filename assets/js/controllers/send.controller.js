angular
  .module('walletApp')
  .controller("SendCtrl", SendCtrl);

function SendCtrl($scope, $log, Wallet, $modalInstance, $timeout, $state, $filter, $stateParams, $translate, paymentRequest, filterFilter, $modal) {
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
    amounts: [0],
    fee: Wallet.settings.feePerKB,
    customFee: null,
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
      Wallet.displayWarning(translation, false, $scope.alerts);
    });
  };

  $scope.applyPaymentRequest = (paymentRequest, i) => {
    $scope.processingPaymentRequest = true;
    let destination = {
      address: paymentRequest.address || "",
      label: paymentRequest.address || "",
      type: "External"
    };
    $scope.refreshDestinations(paymentRequest.address, i);
    $scope.transaction.amounts[i] = paymentRequest.amount || 0;
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
        Wallet.displayWarning(translation, false, $scope.alerts);
      });
      $log.error("Not a bitcoin QR code:" + url);
    }
  };

  $scope.cameraOn = (index=0) => {
    $scope.$broadcast('ResetSearch' + index);
    $scope.cameraRequested = true;
    $scope.qrIndex = index;
  };

  $scope.cameraOff = () => {
    $scope.cameraIsOn = false;
    $scope.cameraRequested = false;
    $scope.qrIndex = null;
  };

  $scope.close = () => {
    Wallet.clearAlerts();
    $modalInstance.dismiss("");
  };

  $scope.resetSendForm = () => {
    $scope.transaction = angular.copy($scope.transactionTemplate);
    $scope.transaction.from = Wallet.accounts()[Wallet.my.wallet.hdwallet.defaultAccountIndex];
    $scope.transaction.customFee = Wallet.settings.feePerKB;

    // Remove error messages:
    $scope.validateAmounts();
    $scope.sendForm.$setPristine();
    $scope.sendForm.$setUntouched();

    for (let i = 0; i < $scope.destinations.length; i++) {
      $scope.$broadcast('ResetSearch' + i);
    }
  };

  $scope.addDestination = () => {
    let originalDestinations = angular.copy($scope.destinations[0]);
    $scope.destinations.push(originalDestinations);
    $scope.transaction.amounts.push(0);
    $scope.transaction.destinations.push(null);
  };

  $scope.removeDestination = (index) => {
    $scope.destinations.splice(index, 1);
    $scope.transaction.amounts.splice(index, 1);
    $scope.transaction.destinations.splice(index, 1);
  };

  $scope.numberOfActiveAccountsAndLegacyAddresses = () => {
    let numAccts = Wallet.accounts().filter(a => !a.archived).length;
    let numAddrs = Wallet.legacyAddresses().filter(a => !a.archived).length;
    return numAccts + numAddrs;
  };

  $scope.send = () => {
    if ($scope.sending) return;

    $scope.sending = true;
    $scope.transaction.note = $scope.transaction.note.trim();

    Wallet.clearAlerts();

    if ($scope.transaction.publicNote) {
      $scope.payment.note($scope.transaction.note);
    }

    const transactionFailed = (message) => {
      $scope.sending = false;
      if (message) {
        $translate(message).then(t => {
          Wallet.displayError(t, false, $scope.alerts);
        });
      }
    };

    const transactionSucceeded = (tx) => {
      $scope.sending = false;
      $modalInstance.close("");
      Wallet.beep();

      let note = $scope.transaction.note;
      if (!$scope.transaction.publicNote && note !== "") {
        Wallet.setNote({ hash: tx.txid }, note);
      }

      let index = $scope.transaction.from.index || 'imported';

      if (!($state.current.name === "wallet.common.transactions" || $stateParams.accountIndex === "accounts")) {
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
    Wallet.closeAlert(alert);
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
    if ($scope.transaction.destinations[0] == null) return;

    if ($scope.advanced && $scope.transaction.destinations.length > 1) {
      $scope.toLabel = $scope.transaction.destinations.length + ' Recipients';
    } else {
      $scope.toLabel = $scope.transaction.destinations[0].label;
      if ($scope.transaction.destinations[0].index != null) {
        $scope.toLabel += " Account";
      }
    }
  };

  $scope.refreshDestinations = (query, i) => {
    if (query === "" && $scope.processingPaymentRequest) return;
    if ($scope.destinations[i].length === 0) return;

    $scope.updateToLabel();
    $scope.addExternalLabelIfNeeded(query, i);
  };

  $scope.addExternalLabelIfNeeded = (query, idx) => {
    let last = $scope.destinations[idx].slice(-1)[0];
    if (query != null) {
      last.address = query;
      last.label = query;
    }
    if ($scope.transaction.destinations[idx] == null || $scope.transaction.destinations[idx].type !== "External") {
      let destinations = $scope.destinations[idx];
      for (let i = 0; i < destinations.length; i++) {
        let destination = destinations[i];
        if (destination.type !== "External" && (destination.label.indexOf(query) !== -1 || (destination.address && destination.address.indexOf(query) !== -1))) {
          if (destination.address && destination.address.indexOf(query) !== -1) {
            console.log("Reset!");
            $scope.transaction.destinations[idx] = destination;
          }
          return;
        }
      }
      return $scope.transaction.destinations[idx] = last;
    }
  };

  $scope.getTransactionTotal = (includeFee) => {
    let tx = $scope.transaction;
    let fee = includeFee ? (tx.customFee || tx.fee) : 0;
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
        Wallet.displayError(msg, false, $scope.alerts);
        $scope.$root.$safeApply($scope);
      });
  };

  $scope.buildTx = () => {
    let valid = !$scope.sendForm.$invalid &&
                $scope.sendForm.$dirty &&
                $scope.amountIsValid;
    if (valid) {
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
    destinations = destinations.map(d => d.index || d.address);
    $scope.payment.to(destinations);
    $scope.buildTx();
  };

  $scope.setPaymentAmount = () => {
    $scope.payment.amount($scope.transaction.amounts)
    $scope.buildTx();
  };

  $scope.setPaymentFee = () => {
    let fee = ($scope.advanced) ? $scope.transaction.customFee : null;
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
    $scope.transaction.customFee = $scope.transaction.fee;
    $scope.setPaymentFee();
  };

  $scope.regularSend = () => {
    $scope.transaction.customFee = null;
    $scope.transaction.destinations.splice(1);
    $scope.transaction.amounts.splice(1);
    $scope.advanced = false;
    $scope.setPaymentFee();
  };

}
