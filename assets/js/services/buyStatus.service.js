angular
  .module('walletApp')
  .factory('buyStatus', buyStatus);

function buyStatus (Wallet, MyWallet, Options, $cookies, Alerts, $state, $q) {
  const service = {};

  let isCountryWhitelisted = null;
  let buyReminder = $cookies.getObject('buy-bitcoin-reminder');
  let nextWeek = () => new Date(Date.now() + 604800000).getTime();

  let setIsCountryWhitelisted = (options) => {
    let accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;

    let whitelist = options.showBuySellTab || [];
    isCountryWhitelisted = accountInfo && whitelist.indexOf(accountInfo.countryCodeGuess) > -1;
  };

  service.canBuy = () => {
    let accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;
    let isUserInvited = accountInfo && accountInfo.invited;

    if (Options.didFetch) {
      setIsCountryWhitelisted(Options.options);
      return $q.resolve(isUserInvited && isCountryWhitelisted);
    } else {
      return Options.get().then(setIsCountryWhitelisted)
                          .then(() => isUserInvited && isCountryWhitelisted);
    }
  };

  service.shouldShowBuyReminder = () => {
    let timeHasPassed = buyReminder ? new Date() > buyReminder.when : true;
    let shownTwice = buyReminder ? buyReminder.index >= 2 : false;
    let firstTime = Wallet.goal.firstTime;

    return (!firstTime && !shownTwice && timeHasPassed) || (!firstTime && !buyReminder);
  };

  service.showBuyReminder = () => {
    let options = (ops) => angular.merge({ friendly: true, modalClass: 'top' }, ops);
    let saidNoThanks = (e) => e === 'cancelled' ? $q.resolve() : $q.reject();
    let goToBuy = () => $state.go('wallet.common.buy-sell');

    let nextIndex = buyReminder ? buyReminder.index + 1 : 0;

    Alerts.confirm('BUY_BITCOIN_REMINDER', options({cancel: 'NO_THANKS', action: 'GET_BITCOIN', iconClass: 'hide'}))
          .then(goToBuy, saidNoThanks);

    $cookies.putObject('buy-bitcoin-reminder', {
      index: nextIndex,
      when: nextWeek()
    });
  };

  service.userHasAccount = () => MyWallet.wallet.external && MyWallet.wallet.external.coinify && MyWallet.wallet.external.coinify.hasAccount;

  return service;
}
