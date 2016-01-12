angular
  .module('walletApp')
  .factory('Alerts', Alerts);

Alerts.$inject = ['$timeout', '$rootScope'];

function Alerts($timeout, $rootScope) {
  const service = {
    alerts          : [],
    close           : close,
    clear           : clear,
    displayInfo     : display.bind(null, 'info'),
    displaySuccess  : display.bind(null, 'success'),
    displayWarning  : display.bind(null, ''),
    displayError    : display.bind(null, 'danger'),
    displayReceivedBitcoin : display.bind(null, 'received-bitcoin'),
    displayVerifiedEmail : displayVerifiedEmail
  };

  function close(alert, context=service.alerts) {
    $timeout.cancel(alert.timer);
    context.splice(context.indexOf(alert), 1);
  }

  function clear(context=service.alerts) {
    while (context.length > 0) {
      let alert = context.pop();
      $timeout.cancel(alert.timer);
    }
  }

  function display(type, message, keep=false, context=service.alerts) {
    let alert = { type: type, msg: message };
    if (!keep) alert.timer = $timeout(() => close(alert), 7000);
    context.push(alert);
  }

  function displayVerifiedEmail() {
    $rootScope.$emit('showNotification', {
      type: 'verified-email',
      icon: 'ti-email',
      heading: translations.SUCCESS,
      msg: translations.EMAIL_VERIFIED_SUCCESS
    });
  }

  return service;
}
