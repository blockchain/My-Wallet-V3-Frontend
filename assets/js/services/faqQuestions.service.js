angular
  .module('walletApp')
  .factory('FaqQuestions', FaqQuestions);

function FaqQuestions () {
  const questions = [
    'HOW_TO_BUY',
    'HOW_TO_SEND',
    'WALLET_SAFETY',
    'HOW_TO_SELL'
  ];

  const service = {
    questions: questions.map(name => ({ name }))
  };

  return service;
}
