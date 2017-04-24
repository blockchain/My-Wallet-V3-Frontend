angular
  .module('walletApp')
  .controller('CoinifyBankAccountController', CoinifyBankAccountController);

function CoinifyBankAccountController ($scope, $q, $timeout, Wallet, buySell, currency, $stateParams) {
  $scope.exchange = buySell.getExchange();
  $scope.qa = {};
  $scope.accountCurrency = $scope.$parent.bankAccount.account.currency;
  $scope.accountType = 'international';
  $scope.showBankName = true;
  $scope.countries = $scope.$parent.sepaCountries;
  $scope.selectedBankCountry = $scope.countries.find(c => c.code === $scope.$parent.exchangeCountry);

  const setAccountTypeHelper = (countryCode, countryName) => {
    $scope.$parent.bankAccount.holder.address.country = countryCode;
    $scope.$parent.bankAccount.bank.address.country = countryCode;
    $scope.$parent.country = countryName;
  };

  // TODO refactor this gross thing
  $scope.setAccountType = (tx) => {
    if ($scope.selectedBankCountry.name === 'Denmark' && $scope.$parent.transaction.currency === 'DKK') {
      $scope.showDanish = true;
      setAccountTypeHelper('DK', 'Denmark');
    }
  };
  $scope.setAccountType($scope.transaction);

  $scope.selectCountry = (type, country) => {
    $scope.selectedBankCountry = country;
    if (type === 'bank') {
      $scope.setAccountType();
      $scope.$parent.bankAccount.bank.address.country = country.code;
      $scope.$parent.country = country.name;
    } else if (type === 'holder') {
      $scope.$parent.bankAccount.holder.address.country = country.code;
    }
  };

  $scope.$parent.bankAccount.bank.address.country = $scope.selectedBankCountry.code;

  $scope.cancel = () => {
    $scope.tempCurrency = $scope.transaction.currency;
    $scope.tempFiat = $scope.transaction.fiat;
    $scope.$parent.fiatFormInvalid = false;
    $scope.toggleEditAmount();
  };

  $scope.changeTempCurrency = (curr) => (
    $scope.getMaxMin(curr).then(() => { $scope.tempCurrency = curr; })
  );

  $scope.turnOffIbanError = () => $scope.$parent.ibanError = false;

  $scope.setAccountCurrency = (currency) => {
    $scope.$parent.bankAccount.account.currency = currency.code;
    $scope.accountCurrency = currency.code;
  };

  $scope.$watch('transaction.currency', (newVal, oldVal) => {
    $scope.tempCurrency = $scope.transaction.currency;
  });

  $scope.$watch('transaction.fiat', (newVal, oldVal) => {
    $scope.tempFiat = $scope.transaction.fiat;
  });

  $scope.$watch('selectedBankCountry', (newVal, oldVal) => {
    $scope.selectedBankCountry = $scope.selectedBankCountry;
  });

  $scope.$watch('rateForm', () => {
    $scope.$parent.rateForm = $scope.rateForm;
  });
}
