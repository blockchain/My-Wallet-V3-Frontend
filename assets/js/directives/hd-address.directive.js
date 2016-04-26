angular.module('walletApp').directive('hdAddress', (Wallet, $translate, Alerts) => {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      address: '=hdAddress',
      searchText: '='
    },
    templateUrl: (elem, attrs) => 'templates/hd-address.jade',
    link: (scope, elem, attrs, ctrl) => {
      const addressIndex = scope.address.index;
      const accountIndex = scope.address.account.index;

      scope.errors = {label: null};
      scope.status = {edit: false};

      scope.removeLabel = () => {
        Alerts.confirm('CONFIRM_REMOVE_LABEL').then(() => {
          scope.address.account.removeLabelForReceivingAddress(addressIndex);
          Wallet.hdAddresses(accountIndex)(true);
        });
      };

      scope.changeLabel = (label, successCallback, errorCallback) => {
        scope.errors.label = null;
        scope.status.edit = false;

        const success = () => {
          scope.status.edit = false;
          successCallback();
        };

        const error = (error) => {
          if (error === 'NOT_ALPHANUMERIC') {
            $translate('INVALID_CHARACTERS_FOR_LABEL').then((translation) => {
              scope.errors.label = translation;
            });
          } else if (error === 'GAP') {
            $translate('LABEL_ERROR_BIP_44_GAP').then((translation) => {
              scope.errors.label = translation;
            });
          } else {
            console.log('Unknown error: ' + error);
          }

          errorCallback();
        };

        Wallet.changeHDAddressLabel(accountIndex, addressIndex, label, success, error);
      };

      scope.cancelEdit = () => {
        scope.status.edit = false;
      };
    }
  };
});
