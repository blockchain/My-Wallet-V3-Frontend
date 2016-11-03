angular
  .module('walletApp')
  .controller('SfoxLinkController', SfoxLinkController);

function SfoxLinkController ($scope, $q) {
  let exchange = $scope.vm.exchange;
  let accounts = $scope.vm.accounts;

  let state = $scope.state = {
    terms: false,
    account: accounts[0],
    readyToVerify: undefined
  };

  $scope.fields = {
    deposit1: undefined,
    deposit2: undefined,
    nickname: undefined,
    routingNumber: undefined,
    accountNumber: undefined,
    type: 'checking'
  };

  $scope.link = () => {
    $scope.lock();

    $q.resolve(exchange.getBuyMethods())
      .then((methods) => addAccount(methods))
      .then((account) => state.account = account)
      .catch(error => console.error(error))
      .finally($scope.free);

    let addAccount = (methods) => {
      // routingNumber, accountNumber, name, nickname, type
      return methods.ach.addAccount($scope.fields.routingNumber,
                                    $scope.fields.accountNumber,
                                    'name',
                                    $scope.fields.nickname,
                                    $scope.fields.type);
    };
  };

  $scope.verify = () => {
    $scope.lock();

    $q.resolve(state.account.verify($scope.fields.deposit1, $scope.fields.deposit2))
      .then(() => $scope.vm.goTo('buy'))
      .catch((err) => console.log(err))
      .finally($scope.free);
  };

  $scope.types = ['checking', 'savings'];
}
