angular
  .module('walletDirectives')
  .directive('destinationInput', destinationInput);

function destinationInput ($rootScope, $timeout, Wallet, format, $httpBackend) {
  // TODO: use Wallet mock, so we don't need to mock this $httpBackend call
  $httpBackend.whenGET('/Resources/wallet-options.json').respond();

  const directive = {
    restrict: 'E',
    require: '^ngModel',
    scope: {
      model: '=ngModel',
      change: '&ngChange',
      onPaymentRequest: '&onPaymentRequest',
      ignore: '=',
      setInputMetric: '&'
    },
    templateUrl: 'templates/destination-input.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs, ctrl) {
    let accounts = Wallet.accounts().filter(a => !a.archived);
    let addresses = Wallet.legacyAddresses().filter(a => !a.archived);
    let addressBook = Wallet.addressBook().map(format.addressBook);

    scope.selectOpen = false;
    scope.limit = 50;
    scope.incLimit = () => scope.limit += 50;
    scope.isLast = (d) => d === scope.destinations[scope.limit - 1];

    scope.dropdownHidden = accounts.length === 1 && addresses.length === 0;
    scope.browserWithCamera = $rootScope.browserWithCamera;

    scope.onAddressScan = (result) => {
      let address = Wallet.parsePaymentRequest(result);
      scope.model = format.destination(address, 'External');
      scope.onPaymentRequest({request: address});
      scope.setInputMetric({metric: 'qr'});
      $timeout(scope.change);
    };

    scope.setModel = (a) => {
      scope.model = a;
      $timeout(scope.change);
    };

    scope.clearModel = () => {
      scope.model = { address: '', type: 'External' };
      $timeout(scope.change);
    };

    scope.focusInput = () => {
      let q = scope.selectOpen ? '.ui-select-search' : '#address-field';
      $timeout(() => elem[0].querySelectorAll(q)[0].focus(), 250);
    };

    let blurTime;
    scope.blur = () => {
      blurTime = $timeout(() => ctrl.$setTouched(), 250);
    };

    scope.focus = () => {
      $timeout.cancel(blurTime);
      ctrl.$setUntouched();
    };

    if (!scope.model) scope.clearModel();
    scope.$watch('model', scope.change);
    scope.$watch('selectOpen', (open) => open && scope.focusInput());

    scope.$watch('ignore', (ignore) => {
      scope.destinations = accounts.concat(addresses).map(format.destination).concat(addressBook);
      if (ignore && typeof ignore === 'object') {
        let filterSame = (dest) => ignore.index != null
          ? dest.index !== ignore.index
          : dest.address !== ignore.address;
        scope.destinations = scope.destinations.filter(filterSame);
      }
    });
  }
}
