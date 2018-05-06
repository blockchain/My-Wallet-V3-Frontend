angular
  .module('walletApp')
  .factory('tradeStatus', tradeStatus);

function tradeStatus ($rootScope, Wallet, MyWallet, MyWalletHelpers, Env, localStorageService, Alerts, $state, $q) {
  const service = {};

  let buySellDisabled = null;
  let isCoinifyCountry = null;
  let isUnocoinCountry = null;
  let isSFOXCountryState = null;

  let sfoxInviteFraction = 0;

  let nextWeek = () => new Date(Date.now() + 604800000).getTime();

  let processEnv = (env) => {
    let accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;

    isUnocoinCountry = accountInfo && env.partners.unocoin.countries.indexOf(accountInfo.countryCodeGuess) > -1;
    isCoinifyCountry = accountInfo && env.partners.coinify.countries.indexOf(accountInfo.countryCodeGuess) > -1;
    isSFOXCountryState = accountInfo && env.partners.sfox.countries.indexOf(accountInfo.countryCodeGuess) > -1 && (env.partners.sfox.states.indexOf(accountInfo.stateCodeGuess) > -1 || accountInfo.stateCodeGuess === undefined);

    sfoxInviteFraction = (env.partners.sfox && env.partners.sfox.inviteFormFraction) || 0;

    buySellDisabled = env.buySell.disabled;
    service.isSFOXCountryState = isSFOXCountryState;
  };

  service.canTrade = () => {
    let accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;
    let isSFOXInvited = accountInfo && accountInfo.invited && accountInfo.invited.sfox;
    let isUnocoinInvited = accountInfo && accountInfo.invited && accountInfo.invited.unocoin;

    // The user can buy if:
    // * they already have an account; or
    // * their IP is in a country supported by Coinify; or
    // * their IP is in a country && state supported by SFOX AND their email is invited; or
    // * their IP is in a whitelisted country and their email is invited
    let canTrade = () => service.userHasAccount() ||
                         isCoinifyCountry ||
                         (isSFOXInvited && isSFOXCountryState) ||
                         (isUnocoinInvited && isUnocoinCountry);

    return Env.then(processEnv).then(canTrade);
  };

  service.shouldShowInviteForm = () => {
    let accountInfo = MyWallet.wallet && MyWallet.wallet.accountInfo;

    return service.canTrade().then((res) => {
      if (res) {
        return false; // Don't show invite form for invited users
      } else {
        if (!isSFOXCountryState) { return false; }
        if (!accountInfo.email) { return false; }
        return MyWalletHelpers.isStringHashInFraction(accountInfo.email, sfoxInviteFraction);
      }
    });
  };

  service.tradeLink = () => {
    let tradeLink = () => {
      let { external } = MyWallet.wallet;
      if (external && (isCoinifyCountry || external.coinify.user)) return 'BUY_AND_SELL_BITCOIN';
      else if (MyWallet.wallet.accountInfo.countryCodeGuess === 'US') return 'BUY_AND_SELL_BITCOIN';
      else return 'BUY_BITCOIN';
    };
    return Env.then(processEnv).then(tradeLink);
  };

  service.shouldShowBuyReminder = () => {
    let buyReminder = localStorageService.get('buy-bitcoin-reminder');
    let timeHasPassed = buyReminder ? new Date() > buyReminder.when : true;
    let shownTwice = buyReminder ? buyReminder.index >= 2 : false;
    let firstTime = Wallet.goal.firstTime;
    let mobileBuy = $rootScope.inMobileBuy;

    return !buySellDisabled && !mobileBuy && !firstTime && (!shownTwice && timeHasPassed || !buyReminder);
  };

  service.showBuyReminder = () => {
    let buyReminder = localStorageService.get('buy-bitcoin-reminder');

    let options = (ops) => angular.merge({ friendly: true, modalClass: 'top' }, ops);
    let saidNoThanks = (e) => e === 'cancelled' ? $q.resolve() : $q.reject();
    let goToBuy = () => $state.go('wallet.common.buy-sell');

    let nextIndex = buyReminder ? buyReminder.index + 1 : 0;

    Alerts.confirm('TRADE_BITCOIN_REMINDER', options({cancel: 'NO_THANKS', action: 'GET_BITCOIN', iconClass: 'hide'}))
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
      (external.unocoin && external.unocoin.hasAccount) ||
      (external.sfox && external.sfox.hasAccount)
    );
  };

  return service;
}
