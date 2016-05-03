angular
  .module('walletApp')
  .directive('destinationInput', destinationInput);

destinationInput.$inject = ['$rootScope', '$timeout', 'Wallet', 'format'];

function destinationInput ($rootScope, $timeout, Wallet, format) {
  const directive = {
    restrict: 'E',
    require: 'ngModel',
    scope: {
      model: '=ngModel',
      change: '&ngChange',
      onPaymentRequest: '&onPaymentRequest'
    },
    templateUrl: 'templates/destination-input.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs, ctrl) {
    let accounts = Wallet.accounts().filter(a => !a.archived);
    let addresses = Wallet.legacyAddresses().filter(a => !a.archived);

    scope.destinations = accounts.concat(addresses).map(format.destination);
    scope.dropdownHidden = accounts.length === 1 && addresses.length === 0;
    scope.browserWithCamera = $rootScope.browserWithCamera;

    scope.onAddressScan = (result) => {
      let address = Wallet.parsePaymentRequest(result);
      scope.model = format.destination(address, 'External');
      scope.onPaymentRequest({request: address});
      $timeout(scope.change);
    };

    scope.setModel = (a) => {
      scope.model = a;
      $timeout(scope.change);
    };

    scope.clearModel = () => {
      scope.model = { address: '', type: 'External' };
      $timeout(scope.change);
    };

    scope.focusInput = (t) => {
      $timeout(() => elem.find('input')[0].focus(), t || 50);
    };

    let blurTime;
    scope.blur = () => {
      blurTime = $timeout(() => {
        ctrl.$setTouched();
      }, 250);
    };

    scope.focus = () => {
      $timeout.cancel(blurTime);
      ctrl.$setUntouched();
    };

    if (!scope.model) scope.clearModel();
    scope.focusInput(250);
    scope.$watch('model', scope.change);
  }
}
