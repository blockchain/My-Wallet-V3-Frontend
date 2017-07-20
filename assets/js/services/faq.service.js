angular
  .module('walletApp')
  .factory('faq', faq);

function faq () {
  const questions = [
    { name: 'CAN_I_BUY_BTC',
      values: {'link': 'wallet.common.buy-sell', 'text': 'START_CLICK_HERE'} },
    { name: 'CAN_I_BUY_ETH' },
    { name: 'WALLET_SAFETY',
      link: ['START_CLICK_HERE', 'wallet.common.security-center'] },
    { name: 'WALLET_ID_VS_ADDRESS' },
    { name: 'HOW_TO_TRANSACT_BTC' },
    { name: 'HOW_TO_TRANSACT_ETH' },
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
