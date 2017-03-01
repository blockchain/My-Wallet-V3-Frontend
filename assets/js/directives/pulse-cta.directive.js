angular
  .module('walletApp')
  .directive('pulseCta', pulseCta);

pulseCta.$inject = ['$cookies'];

function pulseCta () {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      active: '<activeWhen',
      route: '@',
      color: '@',
      messageText: '@',
      buttonText: '@',
      onReveal: '&',
      onDismiss: '&'
    },
    templateUrl: 'templates/pulse-cta.pug',
    link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.dismissed = false;

    scope.revealMessage = () => {
      scope.revealed = true;
      scope.onReveal && scope.onReveal();
    };

    scope.dismissMessage = () => {
      scope.active = scope.revealed = false;
      scope.onDismiss && scope.onDismiss();
    };
  }
}
