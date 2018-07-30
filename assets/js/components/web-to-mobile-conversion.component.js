angular
  .module('walletApp')
  .component('webToMobileConversion', {
    bindings: {
    },
    templateUrl: 'templates/web-to-mobile-conversion.pug',
    controller: WebToMobileConversionController,
    controllerAs: '$ctrl'
  });

function WebToMobileConversionController (modals, $uibModal, localStorageService) {
  this.openModal = modals.openOnce((medium) => {
    return $uibModal.open({
      templateUrl: 'partials/web-to-mobile-conversion.pug',
      windowClass: 'bc-modal initial',
      controller: 'MobileConversionCtrl'
    });
  });

  this.dismiss = () => localStorageService.set('showMobileConversion', false);
}
