angular
  .module('walletApp')
  .controller('SfoxLinkController', SfoxLinkController);

function SfoxLinkController ($scope, $q, sfox, modals) {
  let exchange = $scope.vm.exchange;
  let accounts = $scope.vm.accounts;

  $scope.types = ['checking', 'savings'];
  $scope.openBankHelper = modals.openBankHelper;
  $scope.openDepositHelper = modals.openDepositHelper;

  $scope.setFormValidity = (error, valid) => {
    let form = $scope.$$childHead.verifyBankAccountForm;
    form.deposit1.$setValidity(error, valid);
    form.deposit2.$setValidity(error, valid);
  };

  $scope.displayInlineError = () => $scope.setFormValidity('amount', false);
  $scope.clearInlineError = () => $scope.setFormValidity('amount', true);

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
      .then(methods => addAccount(methods))
      .then(account => state.accounts[0] = account)
      .catch(sfox.displayError)
      .finally($scope.free);

    let addAccount = (methods) => {
      // routingNumber, accountNumber, name, nickname, type
      return methods.ach.addAccount($scope.fields.routingNumber,
                                    $scope.fields.accountNumber,
                                    'name1',
                                    $scope.fields.type);
    };
  };

  $scope.verify = () => {
    $scope.lock();
    $q.resolve(state.accounts[0].verify($scope.fields.deposit1, $scope.fields.deposit2))
      .then(() => $scope.vm.goTo('buy'))
      .catch($scope.displayInlineError)
      .finally($scope.free);
  };

  $scope.installLock();
}
