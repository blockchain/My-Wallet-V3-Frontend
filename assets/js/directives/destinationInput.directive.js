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
      onPaymentRequest: '&onPaymentRequest',
      ignore: '='
    },
    templateUrl: 'templates/destination-input.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs, ctrl) {
    let accounts = Wallet.accounts().filter(a => !a.archived);
    let addresses = Wallet.legacyAddresses().filter(a => !a.archived);

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

    scope.$watch('ignore', () => {
      let destinations = accounts.concat(addresses).map(format.destination);
      let idx = destinations.map((d) => { return d.label; }).indexOf(scope.ignore.label);
      destinations.splice(idx, 1);

      scope.destinations = destinations;
    });
  }
}
