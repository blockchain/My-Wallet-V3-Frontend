angular
  .module('walletApp')
  .component('exchangeUpload', {
    bindings: {
      base: '@',
      locked: '=',
      idType: '=',
      autoFill: '&',
      handleUpload: '&'
    },
    templateUrl: 'templates/exchange/upload.pug',
    controller: ExchangeUploadController,
    controllerAs: '$ctrl'
  });

function ExchangeUploadController (Env, $scope, modals) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  this.openHelper = modals.openHelper;

  this.onUpload = () => this.handleUpload({file: this.file})
                            .then(() => this.file = undefined);
}
