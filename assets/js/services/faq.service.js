angular
  .module('walletApp')
  .factory('faq', faq);

function faq () {
  const questions = [
    'HOW_TO_BUY',
    'HOW_TO_SEND',
    'WALLET_SAFETY',
    'HOW_TO_SELL'
  ];

  const service = {
    questions
  };

  return service;
}
