angular
  .module('walletApp')
  .factory('Confirm', Confirm);

Confirm.$inject = ['$uibModal'];

function Confirm($uibModal) {
  const service = {
    open: open
  }

  function open(translation) {
    return $uibModal.open({
      templateUrl: 'partials/modal-confirm.jade',
      windowClass: 'bc-modal confirm',
      resolve: { translation: () => translation },
      controller: function ModalConfirmCtrl($scope, translation) {
        $scope.translation = translation;
      }
    })
  }

  return service;
}