angular
  .module('walletApp')
  .factory('WalletNetwork', WalletNetwork);

WalletNetwork.$inject = ['MyWalletTokenEndpoints', 'MyWalletNetwork', '$q', '$rootScope', 'Alerts', '$translate'];

function WalletNetwork(MyWalletTokenEndpoints, MyWalletNetwork, $q, $rootScope, Alerts, $translate) {
  const service = {
    resetTwoFactorToken: resetTwoFactorToken,
    verifyEmail: verifyEmail,
    unsubscribe: unsubscribe,
    authorizeApprove: authorizeApprove,
    requestTwoFactorReset : requestTwoFactorReset,
    resendTwoFactorSms: resendTwoFactorSms,
    recoverGuid : recoverGuid
  }

  function resetTwoFactorToken(token) {
    let defer = $q.defer()

    const success = (obj) => {
      defer.resolve(obj);
      $rootScope.$safeApply();
    }

    const error = (e) => {
      defer.reject(e.error);
      $rootScope.$safeApply();
    }

    MyWalletTokenEndpoints.resetTwoFactor(token)
      .then(success)
      .catch(error);

    return defer.promise;
  }

  function verifyEmail(token) {
    let defer = $q.defer();

    const success = (res) => {
      defer.resolve(res.guid);
      $rootScope.$safeApply();
    }

    const error = (res) => {
      console.log(res.error);
      defer.reject(res.error);
      $rootScope.$safeApply();
    }

    MyWalletTokenEndpoints.verifyEmail(token)
      .then(success)
      .catch(error);

    return defer.promise;
  }

  function unsubscribe(token) {
    let defer = $q.defer();

    const success = (res) => {
      defer.resolve(res.guid);
      $rootScope.$safeApply();
    }

    const error = (res) => {
      console.log(res.error);
      defer.reject(res.error);
      $rootScope.$safeApply();
    }

    MyWalletTokenEndpoints.unsubscribe(token).then(success).catch(error);

    return defer.promise;
  }

  function authorizeApprove(token, differentBrowserCallback, differentBrowserApproved) {
    let defer = $q.defer()

    const success = (res) => {
      defer.resolve(res);
      $rootScope.$safeApply();
    }

    const error = (res) => {
      console.log(res.error);
      defer.reject(res.error);
      $rootScope.$safeApply();
    }

    const differentBrowser = (details) => {
      differentBrowserCallback(details);
      $rootScope.$safeApply();
    }

    MyWalletTokenEndpoints.authorizeApprove(token, differentBrowser, differentBrowserApproved)
      .then(success)
      .catch(error);

    return defer.promise;
  }

  function requestTwoFactorReset(guid, email, new_email, secret, message, captcha) {
    let defer = $q.defer()

    Alerts.clear()
    let success = (message) => {
      Alerts.displaySuccess(message);
      defer.resolve();
      $rootScope.$safeApply();
    };
    let error = (error) => {
      switch (error) {
        case 'Captcha Code Incorrect':
          Alerts.displayError($translate.instant('CAPTCHA_INCORRECT'), true);
          break;
        case 'Quota Exceeded':
          Alerts.displayError($translate.instant('QUOTA_EXCEEDED'), true);
          break;
        default:
          Alerts.displayError(error, true);
      }

      defer.reject();
      $rootScope.$safeApply();
    };
    MyWalletNetwork.requestTwoFactorReset(guid, email, new_email, secret, message, captcha)
      .then(success)
      .catch(error);

    return defer.promise;
  };

  function resendTwoFactorSms(uid) {
    let defer = $q.defer()

    let success = () => {
      $translate('RESENT_2FA_SMS').then(Alerts.displaySuccess);
      defer.resolve();
      $rootScope.$safeApply();
    };
    let error = (e) => {
      $translate('RESENT_2FA_SMS_FAILED').then(Alerts.displayError);
      defer.reject();
      $rootScope.$safeApply();
    };

    MyWalletNetwork.resendTwoFactorSms(uid).then(success).catch(error);

    return defer.promise;
  };

  function recoverGuid(email, captcha) {
    let defer = $q.defer()
    let success = (message) => {
      Alerts.displaySuccess(message);
      defer.resolve();
      $rootScope.$safeApply();
    };
    let error = (error) => {

      switch (error) {
        case 'Captcha Code Incorrect':
          Alerts.displayError($translate.instant('CAPTCHA_INCORRECT'));
          break;
        case 'Quota Exceeded':
          Alerts.displayError($translate.instant('QUOTA_EXCEEDED'));
          break;
        default:
          Alerts.displayError($translate.instant('UNKNOWN_ERROR'));
      }

      defer.reject();
      $rootScope.$safeApply();
    };
    MyWalletNetwork.recoverGuid(email, captcha).then(success).catch(error);
    return defer.promise;
  };

  return service;
}
