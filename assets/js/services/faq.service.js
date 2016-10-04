angular
  .module('walletApp')
  .factory('faq', faq);

function faq () {
  const questions = [
    'WALLET_SAFETY',
    'WALLET_ID_VS_ADDRESS',
    'HOW_TO_TRANSACT',
    'HOW_MUCH_TO_SEND',
    'WHEN_IS_A_TX_CONFIRMED',
    'CAN_BC_SEE_FUNDS',
    'CAN_BC_RESET_PW'
  ];

  const service = {
    questions
  };

  return service;
}
