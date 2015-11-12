angular.module('walletApp').directive('importedAddress', (Wallet, $translate, $uibModal) => {
  return {
    restrict: "A",
    replace: true,
    scope: {
      address: '=importedAddress',
      searchText: '='
    },
    templateUrl: (elem, attrs) => 'templates/imported-address.jade',
    link: (scope, elem, attrs, ctrl) => {
      scope.errors = {label: null};
      scope.status = {edit: false};

      scope.showAddress = () => {
        let modalInstance = $uibModal.open({
          templateUrl: "partials/request.jade",
          controller: "RequestCtrl",
          resolve: {
            destination: () => scope.address
          },
          windowClass: "bc-modal"
        });
        if (modalInstance != null) {
          modalInstance.opened.then(() => {
            Wallet.store.resetLogoutTimeout();
          });
        }
      };

      scope.archive = () => { Wallet.archive(scope.address) };

      scope.changeLabel = (label, successCallback, errorCallback) => {
        scope.errors.label = null;

        const success = () => {
          scope.status.edit = false;
          successCallback();
        };

        const error = (error) => {
          $translate("INVALID_CHARACTERS_FOR_LABEL").then((translation) => {
            scope.errors.label = translation;
          });
          errorCallback();
        };

        Wallet.changeLegacyAddressLabel(scope.address, label, success, error);
      };

      scope.cancelEdit = () => {
        scope.status.edit = false;
      };

      scope.transfer = () => {
        let modalInstance = $uibModal.open({
          templateUrl: "partials/settings/import-address.jade",
          controller: "AddressImportCtrl",
          windowClass: "bc-modal",
          resolve: {
            address: () => scope.address
          }
        });
        if (modalInstance != null) {
          modalInstance.opened.then(() => {
            Wallet.store.resetLogoutTimeout();
          });
        }
      };

      scope.showPrivKey = () => {
        let modalInstance = $uibModal.open({
          templateUrl: "partials/settings/show-private-key.jade",
          controller: "ShowPrivateKeyCtrl",
          windowClass: "bc-modal",
          resolve: {
            addressObj: () => scope.address
          }
        });
        if (modalInstance != null) {
          modalInstance.opened.then(() => {
            Wallet.store.resetLogoutTimeout();
          });
        }
      };

    }
  };
});
