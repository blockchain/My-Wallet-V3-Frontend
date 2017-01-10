angular
  .module('walletApp')
  .controller('NavigationCtrl', NavigationCtrl);

function NavigationCtrl ($scope, $window, $rootScope, $state, $interval, $timeout, $cookies, $q, $uibModal, Wallet, Alerts, currency, whatsNew, MyWallet, buyStatus) {
  $scope.status = Wallet.status;
  $scope.settings = Wallet.settings;

  $scope.whatsNewTemplate = 'templates/whats-new.jade';
  $scope.lastViewedWhatsNew = null;

  $rootScope.isSubscribed = $cookies.get('subscribed');

  $scope.getTheme = () => $scope.settings.theme;

  const lastViewedDefaultTime = 1231469665000;

  $scope.initialize = (mockFailure) => {
    const fetchLastViewed = () => {
      if (!Wallet.settings.secondPassword) {
        $scope.metaData = MyWallet.wallet.metadata(2, mockFailure);
        $scope.metaData.fetch().then((res) => {
          if (res !== null) {
            $scope.lastViewedWhatsNew = res.lastViewed;
          } else {
            $scope.metaData.create({
              lastViewed: lastViewedDefaultTime
            }).then(() => {
              $scope.lastViewedWhatsNew = lastViewedDefaultTime;
            });
          }
        }).catch((e) => {
          // Fall back to cookies if metadata service is down
          $scope.lastViewedWhatsNew = $cookies.get('whatsNewViewed') || lastViewedDefaultTime;
        });
      } else {
        // Metadata service doesn't work with 2nd password
        $scope.lastViewedWhatsNew = $cookies.get('whatsNewViewed') || lastViewedDefaultTime;
      }
    };

    if ($scope.status.isLoggedIn) {
      if ($scope.status.didUpgradeToHd) {
        fetchLastViewed();
      } else {
        // Wait for upgrade:
        const watcher = $scope.$watch('status.didUpgradeToHd', (newValue) => {
          if (newValue) {
            watcher();
            fetchLastViewed();
          }
        });
      }
    }
  };

  if (!$rootScope.mock) $scope.initialize();

  let nLatestFeats = null;
  $scope.nLatestFeats = () => {
    if (!$scope.feats) {
      return 0;
    } else if (nLatestFeats === null && $scope.lastViewedWhatsNew !== null) {
      nLatestFeats = $scope.feats.filter(({ date }) => date > $scope.lastViewedWhatsNew).length;
    }
    return nLatestFeats;
  };

  $scope.viewedWhatsNew = () => $timeout(() => {
    if ($scope.viewedWhatsNew === null) {
      return;
    }
    nLatestFeats = 0;
    let lastViewed = Date.now();
    $scope.lastViewedWhatsNew = lastViewed;
    if (!Wallet.settings.secondPassword) {
      // Set cookie as a fallback in case metadata service is down
      $cookies.put('whatsNewViewed', lastViewed);
      $scope.metaData.update({
        lastViewed: lastViewed
      });
    } else {
      // Metadata service doesn't work with 2nd password
      $cookies.put('whatsNewViewed', lastViewed);
    }
  });

  $scope.subscribe = () => {
    $uibModal.open({
      templateUrl: 'partials/subscribe-modal.jade',
      windowClass: 'bc-modal initial',
      controller: 'SubscribeCtrl'
    });
  };

  $scope.logout = () => {
    let isSynced = Wallet.isSynchronizedWithServer();
    let needsBackup = !Wallet.status.didConfirmRecoveryPhrase;

    let options = (ops) => angular.merge({ friendly: true, modalClass: 'top' }, ops);
    let saidNoThanks = (e) => e === 'cancelled' ? $q.resolve() : $q.reject();
    let hasNotSeen = (id) => !$cookies.get(id);
    let rememberChoice = (id) => () => $cookies.put(id, true);

    let goToBackup = () => $q.all([$state.go('wallet.common.security-center', {promptBackup: true}), $q.reject('backing_up')]);
    let openSurvey = () => { $window.open('https://blockchain.co1.qualtrics.com/SE/?SID=SV_7PupfD2KjBeazC5'); };

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

  if (Wallet.goal.firstTime) {
    $scope.viewedWhatsNew();
  }

  $interval(() => {
    if (Wallet.status.isLoggedIn) currency.fetchExchangeRate();
  }, 15 * 60000);

  buyStatus.canBuy().then(canBuy => {
    let filterBuy = (feat) => !(feat.title === 'BUY_BITCOIN' && !canBuy);
    $scope.feats = whatsNew.filter(filterBuy);
  });
}
