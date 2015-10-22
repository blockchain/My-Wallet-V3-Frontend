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
      scope.focusInput();
      $timeout(scope.change);
    };

    scope.focusInput = () => {
      $timeout(() => elem.find('input')[0].focus(), 50);
    };

    if (!scope.model) {
      scope.clearModel();
    }

    scope.$watch('model', scope.change);

    // onBlur is triggered when the modal appears for some reason:
    let firstBlur = true;
    scope.onBlur = () => {
      if(firstBlur) {
        firstBlur = false;
        return;
      }
      ctrl.$setTouched();
    }

    scope.onFocus = () => {
      ctrl.$setUntouched();
    }
  }
}
