angular
  .module('walletApp')
  .factory('FaqQuestions', FaqQuestions);

function FaqQuestions () {
  const qs = [
    {
      id: 0,
      question: 'How do I buy bitcoin?',
      answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quis nulla tempus sem auctor auctor. Aenean pellentesque neque magna, ac tincidunt tellus vehicula vitae. Donec sit amet consectetur quam, non iaculis mi.',
      displayed: false
    }, {
      id: 1,
      question: 'How do I send a bitcoin transaction?',
      answer: 'Pellentesque mollis felis ac justo cursus, a ultricies tellus finibus. Vivamus venenatis arcu eget massa tempus, non posuere risus imperdiet. Sed nunc augue, iaculis sit amet ligula ut, rhoncus porta diam.',
      displayed: false
    }, {
      id: 2,
      question: 'How do I make my wallet more safe?',
      answer: 'Sed sit amet vulputate odio, eget gravida nunc. Quisque elementum velit nec nunc eleifend, at accumsan lacus cursus. Fusce a lorem et diam tincidunt sagittis.',
      displayed: false
    }, {
      id: 3,
      question: 'How do I sell bitcoin?',
      answer: 'Morbi finibus nisi a massa fringilla, et convallis nunc porta. Nullam congue aliquam nisi et blandit. Duis nec purus augue. Pellentesque vehicula consectetur congue.',
      displayed: false
    }
  ];

  const service = {
    getAll: () => qs
  };
  return service;
}
