angular
  .module('walletApp')
  .directive('accountInfo', accountInfo);

function accountInfo () {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      exchange: '='
    },
    templateUrl: 'templates/account-info.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attr) {
    scope.toggle = () => scope.active = !scope.active;
  }
}
