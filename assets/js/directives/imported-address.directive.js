angular.module('walletApp').directive('importedAddress', (Wallet, $translate, $uibModal) => {
  return {
    restrict: 'A',
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
          templateUrl: 'partials/request.jade',
          controller: 'RequestCtrl',
          resolve: {
            destination: () => scope.address,
            focus: () => true,
            hasLegacyAddress: () => null
          },
          windowClass: 'bc-modal auto'
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
        templateUrl: 'partials/settings/transfer.jade',
        controller: 'TransferController',
        windowClass: 'bc-modal',
        resolve: { address: () => scope.address }
      });

      scope.showPrivKey = () => $uibModal.open({
        templateUrl: 'partials/settings/show-private-key.jade',
        controller: 'ShowPrivateKeyCtrl',
        windowClass: 'bc-modal',
        resolve: { addressObj: () => scope.address }
      });

      scope.signMessage = () => $uibModal.open({
        templateUrl: 'partials/settings/sign-message.jade',
        controller: 'SignMessageController',
        windowClass: 'bc-modal initial',
        resolve: {
          addressObj: () => scope.address
        }
      });
	  
	  scope.spend = () => {
	    $uibModal.open({
	    	templateUrl: 'partials/send.jade',
	    	controller: 'SendCtrl',
	    	resolve: {
				paymentRequest: () => ({
					fromAccount: scope.address
				})
			},
			windowClass: 'bc-modal auto'
		});
	  };
    }
  };
});
