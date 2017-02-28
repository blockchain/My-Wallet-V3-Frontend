
angular
  .module('walletApp')
  .directive('ipWhitelistRestrict', ipWhitelistRestrict);

ipWhitelistRestrict.$inject = ['$translate', 'Wallet'];

function ipWhitelistRestrict ($translate, Wallet) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {},
    templateUrl: 'templates/ip-whitelist-restrict.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.settings = Wallet.settings;

    scope.enableIpWhitelistRestrict = () =>
      Wallet.enableRestrictToWhiteListedIPs();

    scope.disableIpWhitelistRestrict = () =>
      Wallet.disableRestrictToWhiteListedIPs();
  }
}
