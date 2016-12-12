angular
  .module('walletApp')
  .factory('cta', cta);

function cta ($cookies, Wallet) {
  const cookieJar = {};
  const ONE_WEEK = 604800000;
  const BUY_CTA_KEY = 'buy-alert-seen';
  const SECURITY_WARNING_KEY = 'contextual-message';
  const SECURITY_MESSAGES = ['SECURE_WALLET_MSG_1', 'SECURE_WALLET_MSG_2'];

  const service = {
    shouldShowBuyCta,
    setBuyCtaDissmissed,
    shouldShowSecurityWarning,
    setSecurityWarningDismissed,
    getSecurityWarningMessage
  };

  cacheCookies();
  return service;

  function cacheCookies () {
    cookieJar[BUY_CTA_KEY] = $cookies.get(BUY_CTA_KEY);
    cookieJar[SECURITY_WARNING_KEY] = $cookies.getObject(SECURITY_WARNING_KEY);
  }

  function shouldShowBuyCta () {
    return cookieJar[BUY_CTA_KEY] !== 'true';
  }

  function setBuyCtaDissmissed () {
    $cookies.put(BUY_CTA_KEY, true);
    cacheCookies();
  }

  function shouldShowSecurityWarning () {
    let messageCookie = cookieJar[SECURITY_WARNING_KEY];
    let isTime = messageCookie ? Date.now() > messageCookie.when : true;
    let hasBalance = Wallet.total('') > 0;
    let didBackup = Wallet.status.didConfirmRecoveryPhrase;
    let has2FA = Wallet.settings.needs2FA;
    let verifiedEmail = Wallet.user.isEmailVerified;
    let isSecure = didBackup && (has2FA || verifiedEmail);
    return isTime && hasBalance && !isSecure;
  }

  function setSecurityWarningDismissed () {
    let messageCookie = cookieJar[SECURITY_WARNING_KEY];
    let index = messageCookie ? messageCookie.index + 1 : 0;
    let when = nextWeek();
    $cookies.putObject(SECURITY_WARNING_KEY, { index, when });
    cacheCookies();
  }

  function getSecurityWarningMessage () {
    let messageCookie = cookieJar[SECURITY_WARNING_KEY];
    let messageIndex = messageCookie ? messageCookie.index : 0;
    let message = SECURITY_MESSAGES[messageIndex];
    return message;
  }

  function nextWeek () {
    return new Date(Date.now() + ONE_WEEK).getTime();
  }
}
