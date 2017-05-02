angular
  .module('walletApp')
  .factory('buyStatus', buyStatus);

function buyStatus ($rootScope, Wallet, MyWallet, MyWalletHelpers, Options, localStorageService, Alerts, $state, $q) {
  const service = {};

  let isCountryWhitelisted = null;
  let isCoinifyCountry = null;
  let isSFOXCountry = null;

  let sfoxInviteFraction = 0;

  let nextWeek = () => new Date(Date.now() + 604800000).getTime();

  let processOptions = (options) => {
    let accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;

    // Coinify countries are no longer invite-only
    isCoinifyCountry = accountInfo && options.partners.coinify.countries.indexOf(accountInfo.countryCodeGuess) > -1;
    isSFOXCountry = accountInfo && options.partners.sfox.countries.indexOf(accountInfo.countryCodeGuess) > -1;

    let whitelist = options.showBuySellTab || [];
    isCountryWhitelisted = accountInfo && whitelist.indexOf(accountInfo.countryCodeGuess) > -1;

    sfoxInviteFraction = (options.partners.sfox && options.partners.sfox.inviteFormFraction) || 0;
  };

  service.canBuy = () => {
    let accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;
    let isUserInvited = accountInfo && accountInfo.invited && accountInfo.invited.sfox;

    // The user can buy if:
    // * they already have an account; or
    // * their IP is in a country supported by Coinify; or
    // * their IP is in a country supported by SFOX AND their email is invited
    let canBuy = () => service.userHasAccount() || isCoinifyCountry || (isUserInvited && isCountryWhitelisted);

    if (Options.didFetch) {
      processOptions(Options.options);
      return $q.resolve(canBuy());
    } else {
      return Options.get().then(processOptions)
                          .then(canBuy);
    }
  };

  service.shouldShowInviteForm = () => {
    let accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;

    return service.canBuy().then((res) => {
      if (res) {
        return false; // Don't show invite form for invited users
      } else {
        if (!isSFOXCountry) { return false; }
        if (!accountInfo.email) { return false; }
        return MyWalletHelpers.isEmailInvited(accountInfo.email, sfoxInviteFraction);
      }
    });
  };

  // check to make sure this does not get called on home
  service.shouldShowBuyReminder = () => {
    let buyReminder = localStorageService.get('buy-bitcoin-reminder');
    let timeHasPassed = buyReminder ? new Date() > buyReminder.when : true;
    let shownTwice = buyReminder ? buyReminder.index >= 2 : false;
    let firstTime = Wallet.goal.firstTime;
    let mobileBuy = $rootScope.inMobileBuy;

    return !mobileBuy && !firstTime && (!shownTwice && timeHasPassed || !buyReminder);
  };

  service.showBuyReminder = () => {
    let buyReminder = localStorageService.get('buy-bitcoin-reminder');

    let options = (ops) => angular.merge({ friendly: true, modalClass: 'top' }, ops);
    let saidNoThanks = (e) => e === 'cancelled' ? $q.resolve() : $q.reject();
    let goToBuy = () => $state.go('wallet.common.buy-sell');

    let nextIndex = buyReminder ? buyReminder.index + 1 : 0;

    Alerts.confirm('BUY_BITCOIN_REMINDER', options({cancel: 'NO_THANKS', action: 'GET_BITCOIN', iconClass: 'hide'}))
          .then(goToBuy, saidNoThanks);

    localStorageService.set('buy-bitcoin-reminder', {
      index: nextIndex,
      when: nextWeek()
    });
  };

  service.userHasAccount = () => {
    let external = MyWallet.wallet && MyWallet.wallet.external;

    return external && (
      (external.coinify && external.coinify.hasAccount) ||
      (external.sfox && external.sfox.hasAccount)
    );
  };

  return service;
}
