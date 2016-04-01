
angular
  .module('walletApp')
  .directive('qrScan', qrScan);

function qrScan($rootScope, $timeout, $translate, Wallet, Alerts) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      onScan: '='
    },
    templateUrl: 'templates/qr-scan-button.jade',
    link: link
  };
  return directive;

  function link(scope) {
    scope.popoverTemplate = 'templates/qr-scan-popover.jade';
    scope.browserWithCamera = $rootScope.browserWithCamera;

    scope.loader = () => {
      if (scope.cameraOn) return;

      scope.loading = true;
      $timeout(() => { scope.loading = false }, 1000)
    };

    scope.onCameraResult = (result) => {
      scope.scanComplete = true;

      scope.scanSuccess = Wallet.isValidAddress(Wallet.parsePaymentRequest(result).address) ||
                          Wallet.isValidPrivateKey(result) ||
                          Wallet.isValidAddress(result)

      $rootScope.$safeApply();

      if (scope.scanSuccess && scope.onScan && scope.cameraOn) scope.onScan(result);

      $timeout(() => scope.cameraOn = false, 1250);
      $timeout(() => scope.scanComplete = false, 1500);
    };

    scope.onCameraError = () => {
      scope.cameraOn = false;
      Alerts.displayWarning('CAMERA_PERMISSION_DENIED');
    };
  }
}
