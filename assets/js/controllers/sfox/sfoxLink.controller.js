angular
  .module('walletApp')
  .controller('SfoxLinkController', SfoxLinkController);

function SfoxLinkController ($scope, $q, $timeout, sfox, modals) {
  let exchange = $scope.vm.exchange;
  let accounts = $scope.vm.accounts;

  $scope.types = ['checking', 'savings'];
  $scope.openBankHelper = modals.openBankHelper;
  $scope.openDepositHelper = modals.openDepositHelper;

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
    type: 'checking',
    bankAccount: undefined
  };

  $scope.displayInlineError = (error) => {
    let bankForm = $scope.$$childHead.bankAccountForm;
    let verifyForm = $scope.$$childHead.verifyBankAccountForm;
    switch (JSON.parse(error).error) {
      case 'must provide routing number':
        bankForm.routingNumber.$setValidity('value', false);
        break;
      case 'must provide account number':
        bankForm.accountNumber.$setValidity('value', false);
        break;
      case 'invalid amounts':
        verifyForm.deposit1.$setValidity('value', false);
        verifyForm.deposit2.$setValidity('value', false);
        break;
      default:
        sfox.displayError(error);
    }
  };

  $scope.clearInlineErrors = (form, ...fields) => {
    fields.forEach(f => form[f].$setValidity('value', true));
  };

  $scope.link = () => {
    $scope.lock();

    let addAccount = (methods) => methods.ach.addAccount(
      $scope.fields.routingNumber,
      $scope.fields.accountNumber,
      'name1',
      $scope.fields.type
    );

    $q.resolve(exchange.getBuyMethods())
      .then(addAccount)
      .then(account => state.accounts[0] = account)
      .catch($scope.displayInlineError)
      .finally($scope.free);
  };

  $scope.verify = () => {
    $scope.lock();
    $q.resolve(state.accounts[0].verify($scope.fields.deposit1, $scope.fields.deposit2))
      .then(() => $scope.vm.goTo('buy'))
      .catch($scope.displayInlineError)
      .finally($scope.free);
  };

  $scope.getBankAccounts = (token) => {
    $q.resolve(exchange.bankLink.getAccounts(token))
      .then((bankAccounts) => $scope.state.bankAccounts = bankAccounts)
      .then(() => $scope.fields.bankAccount = $scope.state.bankAccounts[0])
      .catch(sfox.displayError);
  };

  $scope.setBankAccount = () => {
    let account;

    let addAccount = (methods) => methods.ach.addAccount(
      account.routing_number,
      account.account_number,
      account.bank_name,
      $scope.fields.bankAccount.subtype
    );

    let obj = {
      token: $scope.token,
      id: $scope.fields.bankAccount._id,
      lastName: exchange.profile.lastName || null,
      firstName: exchange.profile.firstName || null
    };

    $q.resolve(exchange.bankLink.setAccount(obj))
      .then((res) => account = res.bankAccount)
      .then(exchange.getBuyMethods()
      .then((methods) => addAccount))
      .then(() => $scope.vm.goTo('buy'))
      .catch(sfox.displayError)
      .finally($scope.free);
  };

  var linkHandler = Plaid.create({
    product: 'auth',
    env: 'production',
    clientName: 'SFOX',
    key: '0b041cd9e9fbf1e7d93a0d5a39f5b9',
    onLoad: function () {},
    onSuccess: function (public_token, metadata) {
      $scope.token = public_token;
      $scope.getBankAccounts($scope.token);
    },
    onExit: function () {}
  });

  let bindPlaidLink = () => {
    $timeout(() => {
      document.getElementById('linkButton').onclick = function () {
        linkHandler.open();
      };
    }, 10);
  };

  $scope.$watch('vm.step', (newVal) => {
    $scope.vm.steps['link'] === newVal && bindPlaidLink();
  });

  $scope.installLock();
}
