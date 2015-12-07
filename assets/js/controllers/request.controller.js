angular
  .module('walletApp')
  .controller("RequestCtrl", RequestCtrl);

function RequestCtrl($scope, Wallet, Alerts, $uibModalInstance, $log, destination, focus, $translate, $stateParams, filterFilter, $filter) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;
  $scope.accounts = Wallet.accounts;
  $scope.legacyAddresses = Wallet.legacyAddresses;
  $scope.isBitCurrency = Wallet.isBitCurrency;
  $scope.destinations = [];
  $scope.receiveAddress = null;
  $scope.advanced = false;
  $scope.focus = focus;

  $scope.fields = {
    to: null,
    amount: null,
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
      if ((destination != null) && (destination.address != null) && destination.address === addr.address) {
        $scope.fields.to = addr;
      }
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
    Alerts.close(alert);
  };

  $scope.advancedReceive = () => {
    $scope.advanced = true;
  }

  $scope.regularReceive = () => {
    $scope.advanced = false;
    $scope.fields.label = "";
  }

  $scope.done = () => {
    Alerts.clear();

    if($scope.fields.label == "" || $scope.fields.to.index == undefined) {
        $uibModalInstance.dismiss("");
    } else {

      const success = () => {
        $uibModalInstance.dismiss("");
      };

      const error = (error) => {
        if(error === "NOT_ALPHANUMERIC") {
          $scope.requestForm.label.$error.characters = true;
        } else if (error === "GAP") {
          $scope.requestForm.label.$error.gap = true;
        }
        $scope.requestForm.label.$valid = false;
      };

      let idx = $scope.fields.to.index;
      Wallet.changeHDAddressLabel($scope.fields.to.index, Wallet.getReceivingAddressIndexForAccount(idx), $scope.fields.label, success, error);
    };

  };

  $scope.cancel = () => {
    Alerts.clear();
    $uibModalInstance.dismiss("");
  }

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
      if ($stateParams.accountIndex === "" || ($stateParams.accountIndex == null)) {

      } else if ($stateParams.accountIndex === "imported" || ($stateParams.accountIndex == null)) {

      } else {
        idx = parseInt($stateParams.accountIndex);
      }
      return $scope.fields.to = $scope.accounts()[idx];
    }
  });

  $scope.paymentRequestAddress = () => {
    if(!$scope.status.didInitializeHD) {
      return null;
    }

    if (($scope.fields.to != null) && ($scope.fields.to.address != null)) {
      $scope.advanced = false;
      return $scope.fields.to.address;
    } else if ($scope.status.didInitializeHD) {
      let idx = $scope.fields.to.index;
      return Wallet.getReceivingAddressForAccount(idx);
    }
  }

  $scope.paymentRequestURL = () => {
    if($scope.paymentRequestAddress() == null) {
      return null;
    }

    let url = `bitcoin:${ $scope.paymentRequestAddress() }`;

    if ($scope.fields.amount > 0) {
      url += `?amount=${ parseFloat($scope.fields.amount / 100000000) }`;
    }

    return url;
  }


  $scope.setPaymentRequestURL = (address, amount) => {

  };
}
