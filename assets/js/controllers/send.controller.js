angular
  .module('walletApp')
  .controller("SendCtrl", SendCtrl);

function SendCtrl($scope, $log, Wallet, Alerts, currency, $uibModalInstance, $timeout, $state, $filter, $stateParams, $translate, paymentRequest, filterFilter, $uibModal, format, MyWalletHelpers, $rootScope, $q, $http, fees) {

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
  $scope.building = false;

  $scope.fiatCurrency = Wallet.settings.currency;
  $scope.btcCurrency = Wallet.settings.btcCurrency;
  $scope.isBitCurrency = currency.isBitCurrency;

  $scope.transactionTemplate = {
    from: null,
    sweepAmount: null,
    destinations: [null],
    amounts: [null],
    fee: 10000,
    note: "",
    publicNote: false
  };

  $scope.payment = new Wallet.payment({ feePerKb: 30000 });
  $scope.transaction = angular.copy($scope.transactionTemplate);

  let dynamicFeeService = $rootScope.feeServiceDomain + '/fees';
  let dynamicFeeVectorP = $http
    .get(dynamicFeeService)
    .then(response => response.data.estimate);

  dynamicFeeVectorP.then(estimate => {
    $scope.surgeWarning = estimate[1].surge;
    $scope.payment.feePerKb(estimate[1].fee);
    $scope.dynamicFeeAvailable = true;
    $scope.setPaymentFrom();
  });

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

      let msgText = 'string' === typeof message ? message : 'SEND_FAILED';
      if (msgText.indexOf('Fee is too low') > -1) msgText = 'LOW_FEE_ERROR';

      $translate(msgText).then(t => {
        Alerts.displayError(t, false, $scope.alerts);
      });
    };

    const transactionSucceeded = (tx) => {
      $rootScope.scheduleRefresh();
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

      $rootScope.$safeApply();
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
    return field.$invalid && !field.$untouched;
  };

  $scope.hasInsufficientError = (index) => {
    return !$scope.amountIsValid;
  };

  $scope.getAvailableBalance = () => {
    let tx = $scope.transaction;
    if (!tx.from) return 0;
    let availableBal = tx.from.balance - tx.fee;
    let maxAvailable = tx.sweepAmount || availableBal;
    if ($scope.advanced && !isNaN(tx.sweepFee)) maxAvailable += (tx.sweepFee - tx.fee);
    if (maxAvailable < 0) maxAvailable = 0;
    return isNaN(maxAvailable) ? tx.from.balance : maxAvailable;
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
    if (tx.fee != null) {
      $scope.transaction.fee = tx.forcedFee ? tx.forcedFee : tx.fee;
      $scope.validateAmounts();
      $scope.$safeApply();

      dynamicFeeVectorP.then(estimates => { $timeout(() => {
        $scope.blockIdx = fees.getClosestBlock($scope.transaction.fee, tx.transaction.sizeEstimate, estimates);
      })});
    }
    if (tx.sweepAmount != null && tx.sweepAmount !== $scope.transaction.sweepAmount) {
      $scope.transaction.sweepAmount = tx.sweepAmount;
      $scope.transaction.sweepFee = tx.sweepFee;
      $scope.$root.$safeApply($scope);
    }
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
    $scope.payment.from(origin).sideEffect($scope.handleTxUpdate);
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

  $scope.backToForm = () => {
    $scope.confirmationStep = false;
  };

  $scope.advancedSend = () => {
    $scope.advanced = true;
    $scope.buildTx();
  };

  $scope.regularSend = () => {
    $scope.transaction.destinations.splice(1);
    $scope.transaction.amounts.splice(1);
    $scope.advanced = false;
    $scope.setPaymentFee();
  };

  $scope.goToConfirmation = () => {
    $scope.building = true;

    $scope.setAllAndBuild()
      .then($scope.checkFee)
      .then(fee => $scope.transaction.fee = fee)
      .then($scope.setAllAndBuild)
      .then(() => $scope.confirmationStep = true)
      .catch(errorMsg => {
        $scope.backToForm();
        Alerts.clear($scope.alerts);
        if (['cancelled', 'backdrop click', 'escape key press'].indexOf(errorMsg) === -1) {
          Alerts.displayError(errorMsg, false, $scope.alerts);
        }
        $scope.$root.$safeApply($scope);
      })
      .finally(() => $scope.building = false);
  };

  $scope.buildPayment = () => {
    return $q((resolve, reject) => {
      $scope.payment.buildbeta()
        .then((p) => {
          $scope.buildTx();
          resolve(p.transaction);
          return p;
        })
        .catch((r) => {
          reject(r.error.message || r.error);
          return r.payment;
        });
    });
  }

  $scope.setAllAndBuild = () => {
    $scope.setPaymentFrom();
    $scope.setPaymentTo();
    $scope.setPaymentAmount();
    $scope.setPaymentFee();

    return $scope.buildPayment();
  };

  $scope.checkFee = (tx) => {
    let goAdvanced = () => $scope.advancedSend();

    let suggestFee = (fee) => {
      $scope.transaction.fee = fee;
      $scope.setPaymentFee();
    };

    let surge = $scope.surgeWarning && !$scope.advanced;
    let currentFee = $scope.transaction.fee;
    let minimumFee = 5000;
    let highestFeePossible = $scope.transaction.from.balance - $scope.transaction.amounts.reduce((a, b) => a + b, 0);
    let suggestedFee;

    let showFeeWarning = $uibModal.open.bind($uibModal, {
      templateUrl: 'partials/dynamic-fee.jade',
      windowClass: 'bc-modal medium',
      controller: function DynamicFeeController($scope, $uibModalInstance) {
        $scope.surge = surge;
        $scope.currentFee = currentFee;
        $scope.suggestedFee = suggestedFee;
        $scope.balanceOverflow = suggestedFee > highestFeePossible;
        $scope.cancel = () => {
          $uibModalInstance.dismiss('cancelled');
          if (surge) goAdvanced();
        };
        $scope.useCurrent = () => $uibModalInstance.close(currentFee);
        $scope.useSuggested = () => {
          if ($scope.balanceOverflow) {
            $scope.cancel();
            suggestFee($scope.suggestedFee);
          } else {
            $uibModalInstance.close($scope.suggestedFee);
          }
        };
      }
    });

    if (!$scope.dynamicFeeAvailable) {
      console.log('Dynamic fee service unavailable');
      return $q.resolve(currentFee);
    }

    return dynamicFeeVectorP.then(estimate => {
      let high = fees.guessAbsoluteFee(tx.sizeEstimate, estimate[0].fee);
      let mid = fees.guessAbsoluteFee(tx.sizeEstimate, estimate[1].fee);
      let low = fees.guessAbsoluteFee(tx.sizeEstimate, estimate[5].fee);
      low = low < minimumFee ? minimumFee : low;
      console.log('Fees (high: %d, mid: %d, low: %d)', high, mid, low);

      if (currentFee > high) {
        suggestedFee = high;
        return showFeeWarning().result;
      }
      else if (currentFee < low) {
        suggestedFee = low;
        return showFeeWarning().result;
      }
      else if (surge) {
        suggestedFee = mid;
        return showFeeWarning().result;
      }
      return currentFee;
    });
  };

}
