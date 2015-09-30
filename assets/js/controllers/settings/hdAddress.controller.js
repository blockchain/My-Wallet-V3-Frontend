angular
  .module('walletApp')
  .controller("HDAddressCtrl", HDAddressCtrl);

function HDAddressCtrl($scope, Wallet, $log, $state, $stateParams, $filter, $translate) {
  $scope.address = {
    address: null
  };
  $scope.accounts = Wallet.accounts;
  $scope.show = {
    editLabel: false
  };
  $scope.errors = {
    label: null
  };
  $scope.newLabel = null;
  $scope.url = null;

  $scope.signMessage = () => {
    window.confirm("Coming soon");
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

    Wallet.changeHDAddressLabel($scope.account, $scope.addressIndex, label, success, error);
  };

  $scope.didLoad = () => {
    $scope.addressBook = Wallet.addressBook;
    $scope.status = Wallet.status;
    $scope.settings = Wallet.settings;
  };

  $scope.$watchCollection("accounts()", () => {
    const accountIndex = parseInt($stateParams.account);
    const addressIndex = parseInt($stateParams.index);
    $scope.addressIndex = addressIndex;
    const account = Wallet.accounts()[accountIndex];
    $scope.account = account;
    const address = account.receiveAddressAtIndex(addressIndex);

    $scope.url = 'bitcoin://' + address;

    $scope.address  = {
      address: account.receiveAddressAtIndex(addressIndex),
      label:   account.getLabelForReceivingAddress(addressIndex)
    };
  });

  $scope.didLoad();

}
