angular
  .module('walletApp')
  .directive('hdAddress', hdAddress);

function hdAddress ($rootScope, $sce, Alerts, Env) {
  const directive = {
    restrict: 'A',
    replace: true,
    scope: {
      account: '=',
      address: '=hdAddress',
      searchText: '=',
      onRemoveLabel: '=',
      pastAddress: '=',
      onChangeLabel: '='
    },
    templateUrl: 'templates/hd-address.pug',
    link
  };
  return directive;

  function link (scope, elem, attrs, ctrl) {
    scope.cancelEdit = () => scope.editing = false;
    scope.removeLabel = () => scope.onRemoveLabel(scope.address);

    scope.addressLink = (address) => $sce.trustAsResourceUrl(`${Env.rootURL}address/${address}`);

    scope.changeLabel = (label, successCallback, errorCallback) => {
      let success = () => {
        scope.editing = false;
        successCallback();
      };
      let error = (error) => {
        if (error === 'NOT_ALPHANUMERIC') Alerts.displayError('INVALID_CHARACTERS_FOR_LABEL');
        else if (error === 'GAP') Alerts.displayError('GAP');
        errorCallback();
      };

      scope.onChangeLabel(scope.address, label).then(success).catch(error);
    };
  }
}
