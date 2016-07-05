angular
  .module('walletApp')
  .component('labelOrigin', {
    bindings: {
      origin: '<',
      highlight: '<'
    },
    templateUrl: 'templates/label-origin.jade'
  });
