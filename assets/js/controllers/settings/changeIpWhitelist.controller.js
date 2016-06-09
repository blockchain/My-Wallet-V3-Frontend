angular
  .module('walletApp')
  .controller('ChangeIpWhitelistCtrl', ChangeIpWhitelistCtrl);

function ChangeIpWhitelistCtrl ($scope, Wallet, $translate, Alerts) {
  $scope.settings = Wallet.settings;
  $scope.form = {};

  $scope.fields = {
    ipWhitelist: ''
  };

  $scope.reset = () => {
    $scope.fields = {
      ipWhitelist: ''
    };
  };

  $scope.validateIpWhitelist = () => {
    let candidates = $scope.fields.ipWhitelist;
    $scope.errors.ipWhitelist = null;
    if (candidates == null) return false;
    if (candidates === '') return true;
    if (candidates.length > 255) {
      $translate('MAX_CHARACTERS', {
        max: 255
      }).then((translation) => {
        $scope.errors.ipWhitelist = translation;
      });
      return false;
    }
    let candidatesArray = candidates.split(',');
    if (candidatesArray.length > 16) {
      $translate('MAX_IP_ADDRESSES', {
        max: 16
      }).then((translation) => {
        $scope.errors.ipWhitelist = translation;
      });
      return false;
    }
    for (let candidate of candidatesArray) {
      if (candidate.trim() === '%.%.%.%') {
        $translate('NOT_ALLOWED', {
          forbidden: '%.%.%.%'
        }).then((translation) => {
          $scope.errors.ipWhitelist = translation;
        });
        return false;
      }
      let digits_or_wildcards = candidate.trim().split('.');
      if (digits_or_wildcards.length !== 4) return false;
      for (let digit_or_wildcard of digits_or_wildcards) {
        if (digit_or_wildcard === '%') {
        } else {
          let digit = parseInt(digit_or_wildcard, 10);
          if (isNaN(digit) || digit < 0 || digit > 255) return false;
        }
      }
    }
    return true;
  };

  $scope.changeIpWhitelist = () => {
    const success = () => {
      $scope.deactivate();
    };
    const error = () => {
      Alerts.displayError('Failed to update IP whitelist');
    };

    $scope.status.waiting = true;
    Wallet.setIPWhitelist($scope.fields.ipWhitelist, success, error);
  };
}
