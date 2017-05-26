angular.module('walletApp').directive('importedAddress', (Wallet, $translate, $uibModal, modals) => {
  return {
    restrict: 'A',
    replace: true,
    scope: {
      address: '=importedAddress',
      searchText: '='
    },
    templateUrl: (elem, attrs) => 'templates/imported-address.pug',
    link: (scope, elem, attrs, ctrl) => {
      scope.errors = {label: null};
      scope.status = {edit: false};
      scope.settings = Wallet.settings;

      scope.showAddress = () => {
        $uibModal.open({
          templateUrl: 'partials/request.pug',
          controller: 'RequestCtrl',
          resolve: {
            destination: () => scope.address,
            focus: () => true
          },
          windowClass: 'bc-modal initial'
        });
      };

      scope.archive = () => {
        Wallet.archive(scope.address);
        scope.$root.scheduleRefresh();
      };

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

      scope.transfer = () => $uibModal.open({
        templateUrl: 'partials/settings/transfer.pug',
        controller: 'TransferController',
        windowClass: 'bc-modal',
        resolve: { address: () => scope.address }
      });

      scope.showPrivKey = () => $uibModal.open({
        templateUrl: 'partials/settings/show-private-key.pug',
        controller: 'ShowPrivateKeyCtrl',
        windowClass: 'bc-modal',
        resolve: { addressObj: () => scope.address }
      });

      scope.signMessage = () => $uibModal.open({
        templateUrl: 'partials/settings/sign-message.pug',
        controller: 'SignMessageController',
        windowClass: 'bc-modal initial',
        resolve: {
          addressObj: () => scope.address
        }
      });

      scope.spend = () => modals.openSend({ fromAccount: scope.address });
    }
  };
});
