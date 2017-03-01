angular.module('walletApp').directive('watchOnlyAddress', (Wallet, $translate, Alerts) => {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      address: '=watchOnlyAddress',
      searchText: '='
    },
    templateUrl: (elem, attrs) => 'templates/watch-only-address.pug',
    link: (scope, elem, attrs, ctrl) => {
      scope.errors = {label: null};
      scope.status = {edit: false};

      scope.changeLabel = (label, successCallback, errorCallback) => {
        scope.errors.label = null;

        const success = () => {
          scope.status.edit = false;
          successCallback();
        };

        const error = () => {
          $translate('INVALID_CHARACTERS_FOR_LABEL').then((translation) => {
            scope.errors.label = translation;
          });
          errorCallback();
        };

        Wallet.changeLegacyAddressLabel(scope.address, label, success, error);
      };

      scope.cancelEdit = () => {
        scope.status.edit = false;
      };

      scope.delete = () => {
        Alerts.confirm('CONFIRM_DELETE_WATCH_ONLY_ADDRESS').then(() => {
          Wallet.deleteLegacyAddress(scope.address);
          scope.$root.scheduleRefresh();
        });
      };
    }
  };
});
