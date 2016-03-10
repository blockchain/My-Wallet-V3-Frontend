angular
  .module('walletApp')
  .directive('destinationInput', destinationInput);

destinationInput.$inject = ['$rootScope', '$timeout', 'Wallet'];

function destinationInput($rootScope, $timeout, Wallet) {
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

  function link(scope, elem, attrs, ctrl) {
    scope.browserWithCamera = $rootScope.browserWithCamera;
    scope.accounts = Wallet.accounts().filter(a => a.active);

    let format = (a, type) => ({
      label     : a.label || a.address || '',
      address   : a.address || '',
      index     : a.index,
      balance   : a.balance,
      active    : a.active,
      archived  : a.archived,
      type      : type
    });

    scope.onAddressScan = (result) => {
      let address = Wallet.parsePaymentRequest(result)
      scope.model = format(address, 'External');
      scope.onPaymentRequest({request: address});
      $timeout(scope.change);
    };

    scope.setModel = (a) => {
      scope.model = format(a, 'Accounts');
      $timeout(scope.change);
    };

    scope.clearModel = () => {
      scope.model = format({}, 'External');
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
