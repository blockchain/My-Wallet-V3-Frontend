angular
  .module('walletApp')
  .controller('faqCtrl', faqCtrl);

function faqCtrl ($scope, Wallet, MyWallet, $timeout, $stateParams, $state, $rootScope, $uibModal) {
  $scope.items = [
                  {question: 'How do I buy bitcoin?',
                  answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam quis nulla tempus sem auctor auctor. Aenean pellentesque neque magna, ac tincidunt tellus vehicula vitae. Donec sit amet consectetur quam, non iaculis mi. Pellentesque mollis felis ac justo cursus, a ultricies tellus finibus. Vivamus venenatis arcu eget massa tempus, non posuere risus imperdiet. Sed nunc augue, iaculis sit amet ligula ut, rhoncus porta diam. Sed sit amet vulputate odio, eget gravida nunc. Quisque elementum velit nec nunc eleifend, at accumsan lacus cursus. Fusce a lorem et diam tincidunt sagittis.'},
                  {question: 'How do I send a bitcoin transaction?',
                  answer: 'Morbi finibus nisi a massa fringilla, et convallis nunc porta. Nullam congue aliquam nisi et blandit. Duis nec purus augue. Pellentesque vehicula consectetur congue. Proin viverra nibh cursus posuere faucibus. In suscipit metus quis dui hendrerit, sit amet sollicitudin erat consectetur. Praesent iaculis pretium ipsum, non bibendum sapien blandit at. Vestibulum egestas justo at commodo condimentum. Etiam porttitor gravida scelerisque.'}];
}
