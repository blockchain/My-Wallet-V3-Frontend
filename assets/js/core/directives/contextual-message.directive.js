
angular
  .module('walletApp')
  .directive('contextualMessage', contextualMessage);

contextualMessage.$inject = ['$cookies', '$window', 'Wallet', 'SecurityCenter', 'filterFilter'];

function contextualMessage ($cookies, $window, Wallet, SecurityCenter, filterFilter) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/contextual-message.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.presets = ['SECURE_WALLET_MSG_1', 'SECURE_WALLET_MSG_2'];
    scope.msgCookie = $cookies.getObject('contextual-message');
    scope.reveal = false;

    scope.nextWeek = () => new Date(Date.now() + 604800000).getTime();

    scope.showMessage = (index) => {
      scope.messageIndex = index;
      scope.message = scope.presets[index];
    };

    scope.dismissMessage = (nextIndex, time) => {
      time = time || scope.nextWeek();
      scope.dismissed = true;
      scope.reveal = false;
      $cookies.putObject('contextual-message', {
        index: nextIndex,
        when: time
      });
    };

    scope.shouldShow = () => {
      let isTime = scope.msgCookie ? Date.now() > scope.msgCookie.when : true;
      let hasBalance = Wallet.total('') > 0;
      let didBackup = Wallet.status.didConfirmRecoveryPhrase;
      let has2FA = Wallet.settings.needs2FA;
      let verifiedEmail = Wallet.user.isEmailVerified;
      let isSecure = didBackup && (has2FA || verifiedEmail);

      return isTime && hasBalance && !isSecure;
    };

    scope.revealMsg = () =>
      scope.reveal = true;

    let unwatch = scope.$watch('shouldShow()', (show) => {
      if (show) {
        unwatch();
        let idx = scope.msgCookie ? scope.msgCookie.index : 0;
        scope.showMessage(idx);
      }
    });

    // dynamically position beacon
    let n = elem.parent()[0];
    let s = n.children[5];
    let o = () => s.offsetTop;
    let w = () => $window.location.hash;

    let a = (newVal) => {
      if (newVal.indexOf('transactions') !== -1) elem.css('top', o);
    };

    scope.$watch(w, a);
  }
}
