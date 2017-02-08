angular
  .module('walletApp')
  .controller('SfoxLinkController', SfoxLinkController);

function SfoxLinkController ($scope, $q, $sce, $timeout, sfox, modals, Options, $rootScope) {
  let exchange = $scope.vm.exchange;
  let accounts = $scope.vm.accounts;

  let processOptions = (options) => {
    $scope.plaidUrl = $sce.trustAsResourceUrl(`http://localhost:8081/wallet-helper/plaid/#/key/${options.partners.sfox.plaid}/env/${$rootScope.sfoxPlaidEnv || options.partners.sfox.plaidEnv}`);
  };

  if (Options.didFetch) {
    processOptions(Options.options);
  } else {
    Options.get().then(processOptions);
  }

  $scope.types = ['checking', 'savings'];
  $scope.openHelper = modals.openHelper;

  let state = $scope.state = {
    plaid: {},
    terms: false,
    accounts: accounts
  };

  $scope.fields = {
    deposit1: undefined,
    deposit2: undefined,
    accountName: undefined,
    routingNumber: undefined,
    accountNumber: undefined,
    type: 'checking',
    bankAccount: undefined
  };

  $scope.displayInlineError = (error) => {
    let bankForm = $scope.$$childHead.bankAccountForm;
    let verifyForm = $scope.$$childHead.verifyBankAccountForm;
    switch (sfox.interpretError(error)) {
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
      $scope.fields.accountName,
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
    $scope.token = token;
    $q.resolve(exchange.bankLink.getAccounts($scope.token))
      .then((bankAccounts) => $scope.state.bankAccounts = bankAccounts)
      .then(() => $scope.fields.bankAccount = $scope.state.bankAccounts[0])
      .catch(sfox.displayError);
  };

  $scope.setBankAccount = () => {
    let obj = {
      token: $scope.token,
      name: $scope.fields.accountName,
      id: $scope.fields.bankAccount._id
    };

    $q.resolve(exchange.bankLink.setAccount(obj))
      .then(() => $scope.vm.goTo('buy'))
      .catch(sfox.displayError)
      .finally($scope.free);
  };

  $scope.enablePlaid = () => $scope.state.plaid.enabled = true;
  $scope.disablePlaid = () => $scope.state.plaid = {};
  $scope.plaidWhitelist = ['enablePlaid', 'disablePlaid', 'getBankAccounts'];

  let receiveMessage = (e) => {
    if (!e.data.command) return;
    if (e.data.from !== 'plaid') return;
    if (e.data.to !== 'exchange') return;
    if (e.origin !== 'http://localhost:8081') return;
    if ($scope.plaidWhitelist.indexOf(e.data.command) < 0) return;

    e.data.msg ? $scope[e.data.command](e.data.msg) : $scope[e.data.command]();
    $scope.$safeApply();
  };

  window.addEventListener('message', receiveMessage, false);

  $scope.installLock();
}
