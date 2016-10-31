angular
  .module('walletApp')
  .controller('SfoxLinkController', SfoxLinkController);

function SfoxLinkController ($scope, $q) {
  let exchange = $scope.vm.exchange;

  let state = $scope.state = {
    busy: false,
    terms: false
  };

  $scope.fields = {
    nickname: undefined,
    routingNumber: undefined,
    accountNumber: undefined,
    type: 'checking'
  };

  $scope.link = () => {
    $scope.lock();

    $q.resolve(exchange.getBuyQuote(1, 'USD', 'BTC'))
      .then((quote) => quote.getPaymentMediums())
      .then((mediums) => addAccount(mediums))
      .then((account) => { $scope.account = account; console.log(account); })
      .catch(error => console.error(error))
      .finally($scope.free);

    let addAccount = (mediums) => {
      // routingNumber, accountNumber, name, nickname, type
      return mediums.ach.addAccount($scope.fields.routingNumber,
                                    $scope.fields.accountNumber,
                                    'name',
                                    $scope.fields.nickname,
                                    $scope.fields.type);
    };
  };

  $scope.lock = () => { state.busy = true; };
  $scope.free = () => { state.busy = false; };

  $scope.types = ['checking', 'savings'];
}
