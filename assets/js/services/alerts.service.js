angular
  .module('walletApp')
  .factory('Alerts', Alerts);

Alerts.$inject = ['$timeout', '$rootScope', 'BrowserHelper', '$q', '$translate', '$uibModal', '$uibModalStack', 'localStorageService'];

function Alerts ($timeout, $rootScope, BrowserHelper, $q, $translate, $uibModal, $uibModalStack, localStorageService) {
  const service = {
    alerts: [],
    close,
    clear,
    display,
    confirm,
    prompt,
    saving,
    isDuplicate,
    surveyCloseConfirm,
    displayInfo: display.bind(null, 'info'),
    displaySuccess: display.bind(null, 'success'),
    displayWarning: display.bind(null, ''),
    displayError: display.bind(null, 'danger'),
    displayReceivedBitcoin: display.bind(null, 'received-bitcoin'),
    displaySentBitcoin: display.bind(null, 'sent-bitcoin'),
    displayResetTwoFactor
  };

  function close (alert, context = service.alerts) {
    $timeout.cancel(alert.timer);
    context.splice(context.indexOf(alert), 1);
  }

  function clear (context = service.alerts) {
    while (context.length > 0) {
      let alert = context.pop();
      $timeout.cancel(alert.timer);
    }
  }

  function isDuplicate (context = service.alerts, nextAlert) {
    return context.some(alert => alert.msg === nextAlert.msg);
  }

  function display (type, message, keep = false, context = service.alerts) {
    let displayAlert = (msg) => $q((resolve, reject) => {
      let alert = { type, msg };
      let close = service.close.bind(null, alert, context);
      if (isDuplicate(context, alert)) return reject('DUPLICATE');
      alert.close = () => { close(); reject('CLOSED'); };
      alert.action = () => { close(); resolve('CLICKED'); };
      alert.timer = keep ? null : $timeout(alert.close, 7000);
      context.push(alert);
    });
    return $translate(message).then(displayAlert, () => displayAlert(message));
  }

  function displayResetTwoFactor (message) {
    $translate(['SUCCESS']).then(translations => {
      $uibModal.open({
        templateUrl: 'partials/modal-notification.pug',
        controller: 'ModalNotificationCtrl',
        windowClass: 'notification-modal',
        resolve: {
          notification: () => ({
            type: 'verified-email',
            icon: 'ti-email',
            heading: translations.SUCCESS,
            msg: message
          })
        }
      });
    });
  }

  function surveyCloseConfirm (survey, links, index, sell, shift) {
    let link = links[index];
    let surveyOpened = localStorageService.get(survey);

    let hasSeenPrompt = !links.length ||
                        index >= links.length ||
                        surveyOpened && surveyOpened.index >= index;

    if (hasSeenPrompt) {
      if (shift) {
        return service.confirm('CONFIRM_CLOSE_EXCHANGE', {action: 'IM_DONE'})
          .then(() => $uibModalStack.dismissAll());
      }
      if (sell === true) {
        return service.confirm('CONFIRM_CLOSE_SELL', {action: 'IM_DONE'});
      }
      return service.confirm('CONFIRM_CLOSE_BUY', {action: 'IM_DONE'})
        .then(() => $uibModalStack.dismissAll());
    } else {
      localStorageService.set(survey, {index: index});
      let openSurvey = () => BrowserHelper.safeWindowOpen(link);
      return service.confirm('SURVEY_PROMPT', {action: 'TAKE_SURVEY', friendly: true, cancel: 'NO_THANKS'})
                    .then(openSurvey)
                    .catch(() => $uibModalStack.dismissAll());
    }
  }

  // options = { values, props, friendly, success, action, modalClass, iconClass }
  function confirm (namespace, options = {}) {
    return $uibModal.open({
      templateUrl: 'partials/modal-confirm.pug',
      windowClass: `bc-modal confirm ${options.modalClass || ''}`,
      controller: ($scope) => angular.extend($scope, options, { namespace })
    }).result;
  }

  function prompt (message, options = {}) {
    return $uibModal.open({
      templateUrl: 'partials/modal-prompt.pug',
      windowClass: 'bc-modal medium',
      controller: ($scope) => angular.extend($scope, options, { message })
    }).result;
  }

  function saving () {
    return $uibModal.open({
      templateUrl: 'partials/modal-saving.pug',
      windowClass: 'bc-modal confirm top',
      backdrop: 'static',
      keyboard: false,
      controller: function ($uibModalInstance, MyWallet) {
        let sync = () => $q(MyWallet.syncWallet)
          .then(() => $uibModalInstance.close(true))
          .catch(() => sync());
        sync();
      }
    }).result;
  }

  return service;
}
