angular
  .module('walletApp')
  .component('labelOrigin', {
    bindings: {
      origin: '<',
      highlight: '<',
      simple: '<'
    },
    templateUrl: 'templates/label-origin.jade'
  });
