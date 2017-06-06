angular
  .module('walletApp')
  .component('exchangeUpload', {
    bindings: {
      base: '@',
      idType: '=',
      handleUpload: '&'
    },
    templateUrl: 'templates/exchange/upload.pug',
    controller: ExchangeUploadController,
    controllerAs: '$ctrl'
  });

function ExchangeUploadController (Env, $scope) {
  Env.then(env => {
    $scope.buySellDebug = env.buySellDebug;
  });

  this.onUpload = () => this.handleUpload({file: this.file});
  // Need to set this.file to undefined somewhere
}
