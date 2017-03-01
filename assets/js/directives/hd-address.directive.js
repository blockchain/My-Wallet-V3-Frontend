angular
  .module('walletApp')
  .directive('hdAddress', hdAddress);

function hdAddress ($rootScope, $sce, Wallet, Alerts) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      account: '=',
      address: '=hdAddress',
      searchText: '=',
      remove: '&',
      pastAddress: '='
    },
    templateUrl: 'templates/hd-address.pug',
    link
  };
  return directive;

  function link (scope, elem, attrs, ctrl) {
    scope.cancelEdit = () => scope.editing = false;
    scope.removeLabel = () => scope.remove();

    scope.addressLink = (address) => $sce.trustAsResourceUrl(`${$rootScope.rootURL}address/${address}`);

    scope.changeLabel = (label, successCallback, errorCallback) => {
      let success = () => {
        scope.editing = false;
        successCallback();
      };
      let error = (error) => {
        if (error === 'NOT_ALPHANUMERIC') Alerts.displayError('INVALID_CHARACTERS_FOR_LABEL');
        else if (error === 'GAP') Alerts.displayError('GAP');
        error();
      };
      Wallet.changeHDAddressLabel(scope.account.index, scope.address.index, label, success, error);
    };
  }
}
