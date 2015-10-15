angular
  .module('walletApp')
  .controller("AddressCtrl", AddressCtrl);

function AddressCtrl($scope, Wallet, $log, $state, $stateParams, $filter, $translate) {
  $scope.accounts = Wallet.accounts;
  $scope.address = {
    address: null
  };
  $scope.show = {
    watchOnly: false,
    editLabel: false
  };
  $scope.errors = {
    label: null
  };
  $scope.newLabel = null;
  $scope.url = null;

  $scope.$watch("address.address", (newValue) => {
    if (newValue != null) $scope.url = 'bitcoin://' + newValue;
  });

  $scope.signMessage = () => {
    window.confirm("Coming soon")
  };

  $scope.changeLabel = (label, successCallback, errorCallback) => {
    $scope.errors.label = null;

    const success = () => {
      $scope.show.editLabel = false;
      successCallback();
    };

    const error = (error) => {
      $translate("INVALID_CHARACTERS_FOR_LABEL").then((translation) => {
        $scope.errors.label = translation;
      });
      errorCallback();
    };

    Wallet.changeLegacyAddressLabel($scope.address, label, success, error);
  };

  $scope.didLoad = () => {
    $scope.addressBook = Wallet.addressBook;
    $scope.status = Wallet.status;
    $scope.settings = Wallet.settings;
  };

  $scope.$watchCollection("accounts()", () => {
    let address = $filter("getByProperty")("address", $stateParams.address, Wallet.legacyAddresses());
    $scope.address = address;
    $scope.newLabel = address.label;
  });

  $scope.didLoad();

}
