
angular
  .module('walletApp')
  .directive('fakeAddresses', fakeAddresses);

function fakeAddresses($rootScope) {
  const directive = {
    restrict: 'E',
    templateUrl: 'templates/fake-addresses.jade',
    scope: {},
    link: link
  };

  return directive;

  function link(scope, elem, attrs) {
    scope.trigger = attrs['trigger'];

    scope.addresses = [
      {
        'address': '19ae1VtAKS3kr7qx8jJdnommQA6jQNpa24',
        'label': 'New Address',
        'balance': '0.100'
      },
      {
        'address': '1iaiywVra2e1JWxsfxtyWbs6N4nmn7bhE',
        'label': 'New Address',
        'balance': '0.100'
      },
      {
        'address': '1AhEKu12JVLHCBoqQakmWksJrzxNmsyikf',
        'label': 'New Address',
        'balance': '0.100'
      },
      {
        'address': '19rPjRnLZTQbgvM166P6oNX6QhmbECTzxL',
        'label': 'New Address',
        'balance': '0.100'
      },
      {
        'address': '1DW85EiZJGwqpxSdyGJfcEH5AJSGGh1oc',
        'label': 'New Address',
        'balance': '0.100'
      }
    ];

    scope.triggerModal = () => {
      $rootScope.$broadcast(scope.trigger)
    }

  }
}