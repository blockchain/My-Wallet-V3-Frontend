angular
  .module('walletApp')
  .controller('SfoxLinkController', SfoxLinkController);

function SfoxLinkController ($scope, $q, modals) {
  let exchange = $scope.vm.exchange;
  let accounts = $scope.vm.accounts;

  $scope.openBankHelper = modals.openBankHelper;

  let state = $scope.state = {
    terms: false,
    accounts: accounts,
    readyToVerify: undefined
  };

  $scope.fields = {
    deposit1: undefined,
    deposit2: undefined,
    nickname: '',
    routingNumber: undefined,
    accountNumber: undefined,
    type: 'checking'
  };

  $scope.link = () => {
    $scope.lock();

    $q.resolve(exchange.getBuyMethods())
      .then((methods) => addAccount(methods))
      .then((account) => state.accounts[0] = account)
      .catch(error => console.error(error))
      .finally($scope.free);

    let addAccount = (methods) => {
      // routingNumber, accountNumber, name, nickname, type
      return methods.ach.addAccount($scope.fields.routingNumber,
                                    $scope.fields.accountNumber,
                                    'name',
                                    'nickname',
                                    $scope.fields.type);
    };
  };

  $scope.verify = () => {
    $scope.lock();

    $q.resolve(state.accounts[0].verify($scope.fields.deposit1, $scope.fields.deposit2))
      .then(() => $scope.vm.goTo('buy'))
      .catch((err) => console.log(err))
      .finally($scope.free);
  };

  $scope.types = ['checking', 'savings'];
  $scope.installLock();
}
