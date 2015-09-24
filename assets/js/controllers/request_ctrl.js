angular.module('walletApp').controller("RequestCtrl", ($scope, Wallet, Currency, $modalInstance, $log, destination, $translate, $stateParams, filterFilter) => {;
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.accounts = Wallet.accounts;
  $scope.legacyAddresses = Wallet.legacyAddresses;
  $scope.isBitCurrency = Currency.isBitCurrency;
  $scope.destinations = [];
  $scope.receiveAddress = null;

  $scope.fields = {
    to: null,
    amount: 0,
    label: ""
  };

  for(const account of $scope.accounts()) {
    if (account.index != null && !account.archived) {
      let acct = angular.copy(account);
      acct.type = "Accounts";
      $scope.destinations.push(acct);
      if ((destination != null) && (destination.index != null) && destination.index === acct.index) {
        $scope.fields.to = acct;
      }
    }
  };

  for (const address of $scope.legacyAddresses()) {
    if (!address.archived) {
      const addr = angular.copy(address);
      addr.type = "Imported Addresses";
      addr.label = addr.label || addr.address;
      $scope.destinations.push(addr);
    }
  }

  $scope.getFilter = (search, accounts=true) => ({
    label: search,
    type: accounts ? '!External' : 'Imported'
  });

  $scope.determineLabel = origin => {
    if (origin == null) return;
    return origin.label || origin.address;
  };

  $scope.closeAlert = alert => {
    Wallet.closeAlert(alert);
  };

  $scope.close = () => {
    Wallet.clearAlerts();
    $modalInstance.dismiss("");
  };

  $scope.numberOfActiveAccountsAndLegacyAddresses = () => {
    const activeAccounts = filterFilter(Wallet.accounts(), {
      archived: false
    });
    const activeAddresses = filterFilter(Wallet.legacyAddresses(), {
      archived: false
    });
    return activeAccounts.length + activeAddresses.length;
  };

  $scope.$watchCollection("destinations", () => {
    let idx = Wallet.getDefaultAccountIndex();
    if (($scope.fields.to == null) && $scope.accounts().length > 0) {
      if ($stateParams.accountIndex === "accounts" || ($stateParams.accountIndex == null)) {

      } else if ($stateParams.accountIndex === "imported" || ($stateParams.accountIndex == null)) {

      } else {
        idx = parseInt($stateParams.accountIndex);
      }
      return $scope.fields.to = $scope.accounts()[idx];
    }
  });

  $scope.$watch("fields.to.index + fields.to.address + status.didInitializeHD", () => {
    if (($scope.fields.to != null) && ($scope.fields.to.address != null)) {
      $scope.setPaymentRequestURL($scope.fields.to.address, $scope.fields.amount);
    } else if ($scope.fields.label === "" && $scope.status.didInitializeHD) {
      let idx = $scope.fields.to.index;
      $scope.receiveAddress = Wallet.getReceivingAddressForAccount(idx);
      $scope.setPaymentRequestURL($scope.receiveAddress, $scope.fields.amount);
    }
  });

  $scope.$watch("fields.amount + fields.currency.code + fields.label", (oldValue, newValue) => {
    if (($scope.fields.to != null) && $scope.fields.amount) {
      if ($scope.fields.to.address != null) {
        $scope.setPaymentRequestURL($scope.fields.to.address, $scope.fields.amount);
      } else if ($scope.receiveAddress != null) {
        $scope.setPaymentRequestURL($scope.receiveAddress, $scope.fields.amount);
      }
    }
  });

  $scope.setPaymentRequestURL = (address, amount) => {
    $scope.paymentRequestAddress = address;
    $scope.paymentRequestURL = `bitcoin:${ address }`;
    if (amount > 0) {
      $scope.paymentRequestURL += `?amount=${ parseFloat(amount / 100000000) }`;
    }
  };
});
