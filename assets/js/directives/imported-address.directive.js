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
        $uibModal.open({
          templateUrl: "partials/request.jade",
          controller: "RequestCtrl",
          resolve: {
            destination: () => scope.address,
            focus: () => true,
            hasLegacyAddress: () => null
          },
          windowClass: "bc-modal"
        });
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
        $uibModal.open({
          templateUrl: "partials/settings/import-address.jade",
          controller: "AddressImportCtrl",
          windowClass: "bc-modal",
          resolve: {
            address: () => scope.address
          }
        });
      };

      scope.showPrivKey = () => {
        $uibModal.open({
          templateUrl: "partials/settings/show-private-key.jade",
          controller: "ShowPrivateKeyCtrl",
          windowClass: "bc-modal",
          resolve: {
            addressObj: () => scope.address
          }
        });
      };

      scope.signMessage = () => $uibModal.open({
        templateUrl: 'partials/settings/sign-message.jade',
        controller: 'SignMessageController',
        windowClass: 'bc-modal initial',
        backdrop: 'static',
        resolve: {
          addressObj: () => scope.address
        }
      });

    }
  };
});
