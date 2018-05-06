angular
  .module('walletApp')
  .component('exchangeUpload', {
    bindings: {
      base: '@',
      locked: '=',
      idType: '=',
      uploadSteps: '<',
      onUploadStep: '<',
      autoFill: '&',
      handleUpload: '&',
      onClose: '&'
    },
    templateUrl: 'templates/exchange/upload.pug',
    controller: ExchangeUploadController,
    controllerAs: '$ctrl'
  });

function ExchangeUploadController (Env, $scope, modals) {
  Env.then(env => {
    $scope.qaDebugger = env.qaDebugger;
  });

  this.openHelper = modals.openHelper;

  this.onUpload = () => this.handleUpload({file: this.file})
                            .then(() => this.file = undefined);
}
