angular
  .module('walletApp')
  .factory('faq', faq);

function faq (MyWallet, Ethereum, tradeStatus, ShapeShift, modals) {
  let getQuestions = (env, canTrade) => {
    let questions = [
      { name: 'WALLET_SAFETY',
      link: ['START_CLICK_HERE', 'wallet.common.security-center'] },
      { name: 'WALLET_ID_VS_ADDRESS' },
      { name: 'HOW_TO_TRANSACT' },
      { name: 'HOW_MUCH_TO_SEND' },
      { name: 'WHEN_IS_A_TX_CONFIRMED' },
      { name: 'CAN_BC_SEE_FUNDS' },
      { name: 'CAN_BC_RESET_PW', values: {'link': 'wallet.common.security-center', 'text': 'SECURITY_CENTER'} }
    ];

    if (canTrade) {
      let accountInfo = MyWallet.wallet.accountInfo;
      let sellOnly = env.partners.sfox.countries.indexOf(accountInfo.countryCodeGuess) > -1 && env.partners.sfox.states.indexOf(accountInfo.stateCodeGuess) > -1;
      let buyOnly = env.partners.unocoin.countries.indexOf(accountInfo.countryCodeGuess) > -1 && env.partners.unocoin.states.indexOf(accountInfo.stateCodeGuess) > -1;
      let coinifyRecurring = env.partners.coinify.countries.indexOf(accountInfo.countryCodeGuess) > -1 && accountInfo.countryCodeGuess !== 'UK';

      if (ShapeShift.userHasAccess) {
        questions.unshift(
          {
            name: 'HOW_DO_I_BUY_OR_SELL_UNSUPPORTED_CURRS',
            values: {'link': 'wallet.common.shift', 'text': 'Exchange tab'}
          }
        );
      }

      if (coinifyRecurring) {
        questions.unshift(
          { name: 'WHAT_ARE_RECURRING' },
          { name: 'HOW_TO_CANCEL_RECURRING' }
        )
      }

      if (sellOnly) {
        questions.unshift(
          { name: 'HOW_DO_I_SELL',
            values: {'link': 'wallet.common.buy-sell', 'text': 'HERE'}
          }
        );
      } else if (buyOnly) {
        questions.unshift(
          { name: 'HOW_DO_I_BUY',
            values: {'link': 'wallet.common.buy-sell', 'text': 'HERE'}
          }
        );
      } else {
        questions.unshift(
          { name: 'HOW_DO_I_BUY_OR_SELL',
            values: {'link': 'wallet.common.buy-sell', 'text': 'HERE'}
          }
        );
      }
    } else {
      questions.unshift(
        { name: 'CAN_I_BUY_UNINVITED', values: { link: 'wallet.common.shift', 'text': 'Exchange tab' } }
      );
    }

    questions.unshift(
      { name: 'BITCOIN_CASH_ADDRESS' }
    );

    return questions;
  };

  const service = {
    getQuestions
  };

  return service;
}
