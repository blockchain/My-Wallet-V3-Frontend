angular
  .module('walletApp')
  .factory('SecurityCenter', SecurityCenter);

SecurityCenter.$inject = ['$rootScope', 'Wallet'];

function SecurityCenter ($rootScope, Wallet) {
  var settings = Wallet.settings;
  var user = Wallet.user;
  var status = Wallet.status;

  const service = {
    security: {
      level: 0,
      score: 0
    }
  };

  $rootScope.$watch(sumSecurityObjectives, updateLevel);
  return service;

  function updateLevel () {
    let securityObjectives = getSecurityObjectives();
    let securityLevel = 0;

    for (let objective of securityObjectives) {
      if (objective) securityLevel++;
    }

    service.security.level = securityLevel;
    service.security.score = securityLevel / securityObjectives.length;
  }

  function sumSecurityObjectives () {
    return getSecurityObjectives().map(o => o ? 1 : 0).reduce((a, b) => a + b);
  }

  function getSecurityObjectives () {
    return [
      user.isEmailVerified,
      status.didConfirmRecoveryPhrase,
      user.passwordHint,
      settings.needs2FA,
      user.isMobileVerified,
      settings.blockTOR
    ];
  }
}
