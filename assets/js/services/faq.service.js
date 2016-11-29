angular
  .module('walletApp')
  .factory('faq', faq);

function faq (buyStatus) {
  const questions = [
    { name: 'CAN_I_BUY',
      values: {'link': 'wallet.common.buy-sell', 'text': 'CLICK_TO_GET_BTC'} },
    { name: 'WALLET_SAFETY',
      link: ['START_CLICK_HERE', 'wallet.common.security-center'] },
    { name: 'WALLET_ID_VS_ADDRESS' },
    { name: 'HOW_TO_TRANSACT' },
    { name: 'HOW_MUCH_TO_SEND' },
    { name: 'WHEN_IS_A_TX_CONFIRMED' },
    { name: 'CAN_BC_SEE_FUNDS' },
    { name: 'CAN_BC_RESET_PW' }
  ];

  const service = {
    questions
  };

  return service;
}
