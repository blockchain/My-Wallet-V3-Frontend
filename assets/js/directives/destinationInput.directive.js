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
      onRequestQr: '&',
      change: '&ngChange'
    },
    templateUrl: 'templates/destination-input.jade',
    link: link
  };
  return directive;

  function link(scope, elem, attrs, ctrl) {
    scope.browserWithCamera = $rootScope.browserWithCamera;
    scope.accounts = Wallet.accounts().filter(a => a.active);

    let format = (a, type) => ({
      label     : a.label,
      balance   : a.balance,
      active    : a.active,
      archived  : a.archived,
      type      : type
    });

    scope.setModel = (a) => {
      scope.model = format(a, 'Accounts');
      scope.model.index = a.index;
      $timeout(scope.change);
    };

    scope.clearModel = () => {
      scope.model = format({}, 'External');
      scope.model.address = '';
      $timeout(scope.change);
    };

    scope.focusInput = (t) => {
      $timeout(() => elem.find('input')[0].focus(), t || 50);
    };

    scope.onBlur = () => {
      ctrl.$setTouched();
    };

    scope.onFocus = () => {
      ctrl.$setUntouched();
    };

    if (!scope.model) scope.clearModel();
    scope.focusInput(250);
    scope.$watch('model', scope.change);
  }
}
