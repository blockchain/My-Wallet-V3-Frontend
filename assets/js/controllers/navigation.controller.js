angular
  .module('walletApp')
  .controller('NavigationCtrl', NavigationCtrl);

function NavigationCtrl ($scope, $window, $rootScope, BrowserHelper, $state, $interval, $timeout, localStorageService, $q, $uibModal, Wallet, Alerts, currency, whatsNew, MyWallet, buyStatus, Env) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;

  const whatsNewDateCutoff = 7.884e+9; // ~3 months
  const lastViewedDefaultTime = 1231469665000;
  $scope.whatsNewTemplate = 'templates/whats-new.pug';
  $scope.lastViewedWhatsNew = null;

  $rootScope.isSubscribed = localStorageService.get('subscribed');

  $scope.getTheme = () => $scope.settings.theme;

  let asyncAssert = (value) => value ? $q.resolve(value) : $q.reject();

  $scope.fetchLastViewed = () =>
    asyncAssert($scope.metaData && !Wallet.settings.secondPassword)
      .then(() =>
        $scope.metaData.fetch()
          .then(asyncAssert)
          .then(res => res.lastViewed)
      )
      .catch(() => localStorageService.get('whatsNewViewed'))
      .then(value => value || lastViewedDefaultTime);

  $scope.viewedWhatsNew = () => {
    let lastViewed = $scope.lastViewedWhatsNew = Date.now();
    asyncAssert($scope.metaData && !Wallet.settings.secondPassword)
      .then(() => $scope.metaData.update({ lastViewed }))
      .finally(() => localStorageService.set('whatsNewViewed', lastViewed));
  };

  $scope.getNLatestFeats = (feats = [], lastViewed) => (
    (lastViewed && feats.filter(({ date }) => date > lastViewed).length) || 0
  );

  $scope.subscribe = () => {
    $uibModal.open({
      templateUrl: 'partials/subscribe-modal.pug',
      windowClass: 'bc-modal initial',
      controller: 'SubscribeCtrl'
    });
  };

  $scope.logout = () => {
    let isSynced = Wallet.isSynchronizedWithServer();
    let needsBackup = !Wallet.status.didConfirmRecoveryPhrase;

    let options = (ops) => angular.merge({ friendly: true, modalClass: 'top' }, ops);
    let saidNoThanks = (e) => e === 'cancelled' ? $q.resolve() : $q.reject();
    let hasNotSeen = (id) => !localStorageService.get(id);
    let rememberChoice = (id) => () => localStorageService.set(id, true);

    let goToBackup = () => $q.all([$state.go('wallet.common.security-center', {promptBackup: true}), $q.reject('backing_up')]);
    let openSurvey = () => { BrowserHelper.safeWindowOpen('https://blockchain.co1.qualtrics.com/SE/?SID=SV_7PupfD2KjBeazC5'); };

    let remindBackup = () =>
      Alerts.confirm('BACKUP_REMINDER', options({ cancel: 'CONTINUE_LOGOUT', action: 'VERIFY_RECOVERY_PHRASE' }))
        .then(goToBackup, saidNoThanks).then(rememberChoice('backup-reminder'));

    let promptSurvey = () =>
      Alerts.confirm('SURVEY_CONFIRM', options({ cancel: 'NO_THANKS' }))
        .then(openSurvey, saidNoThanks).then(rememberChoice('logout-survey'));

    $q.resolve(isSynced || Alerts.saving())
      .then(() => {
        if (needsBackup && hasNotSeen('backup-reminder')) return remindBackup();
        else if (hasNotSeen('logout-survey')) return promptSurvey();
      })
      .then(() => Wallet.logout());
  };

  $interval(() => {
    if (Wallet.status.isLoggedIn) {
      currency.fetchExchangeRate(Wallet.settings.currency);
      currency.fetchEthRate(Wallet.settings.currency);
    }
  }, 15 * 60000);

  if ($scope.status.isLoggedIn) {
    if (Wallet.goal.firstTime) {
      $scope.viewedWhatsNew();
    } else {
      const watcher = $scope.$watch('status.didUpgradeToHd', (didUpgrade) => {
        if (!didUpgrade) return;
        watcher();
        if (!Wallet.settings.secondPassword) $scope.metaData = MyWallet.wallet.metadata(2);
        $scope.fetchLastViewed().then(lastViewed => { $scope.lastViewedWhatsNew = lastViewed; });
      });
    }
  }

  $q.all([Env, buyStatus.canBuy()]).then(([env, canBuy]) => {
    let now = Date.now();
    let filterBuySell = (feat) => (
      (feat.title !== 'BUY_BITCOIN' || canBuy) &&
      (feat.title !== 'SELL_BITCOIN' || (canBuy && MyWallet.wallet.external.shouldDisplaySellTab(Wallet.user.email, env, 'coinify')))
    );
    $scope.feats = whatsNew.filter(filterBuySell).filter(f => (now - f.date) < whatsNewDateCutoff);
  });

  $scope.$watch('lastViewedWhatsNew', (lastViewed) => $timeout(() => {
    $scope.nLatestFeats = $scope.getNLatestFeats($scope.feats, lastViewed);
  }));
}
