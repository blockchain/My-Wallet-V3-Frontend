angular
  .module('walletApp')
  .controller('ChangeIpWhitelistCtrl', ChangeIpWhitelistCtrl);

function ChangeIpWhitelistCtrl ($scope, Wallet, Alerts) {
  const ipRegex = /^\s?(?:(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|%)\.){3}(?:(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|%)\s?$/;

  $scope.reset = () => {
    $scope.fields = { ipWhitelist: Wallet.settings.ipWhitelist };
  };

  $scope.isWhitelistValid = () => {
    $scope.errors.ipWhitelist = null;
    if (
      $scope.fields.ipWhitelist == null ||
      $scope.fields.ipWhitelist === ''
    ) return true;

    let ips = $scope.fields.ipWhitelist.split(',');
    if (ips.length > 16) {
      $scope.errors.ipWhitelist = 'MAX_IP_ADDRESSES';
      return false;
    }

    for (let i = 0; i < ips.length; i++) {
      let ip = ips[i];
      if (ip === '') continue;
      if (ip.trim() === '%.%.%.%') {
        $scope.errors.ipWhitelist = 'IP_NOT_ALLOWED';
        return false;
      }
      if (!ipRegex.test(ip)) {
        $scope.errors.ipWhitelist = 'IP_INVALID';
        return false;
      }
    }
    return true;
  };

  $scope.setIPWhitelist = () => {
    $scope.status.waiting = true;
    Wallet.setIPWhitelist($scope.fields.ipWhitelist)
      .then($scope.deactivate, () => { Alerts.displayError('IP_WHITELIST_ERROR'); })
      .then(() => $scope.status.waiting = false);
  };
}
