angular
  .module('walletApp')
  .controller('CoinifyBankAccountController', CoinifyBankAccountController);

function CoinifyBankAccountController ($scope, $q, $timeout, Wallet, buySell, currency, Alerts, $stateParams) {
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
    if ($scope.selectedBankCountry.name === 'Denmark') {
      $scope.showDanish = true;
      $scope.britishBank = false;
      $scope.showBankName = false;
      setAccountTypeHelper('DK', 'Denmark');
    }
    if ($scope.selectedBankCountry.name === 'United Kingdom') {
      $scope.britishBank = true;
      $scope.showDanish = false;
      $scope.showBankName = true;
      setAccountTypeHelper('GB', 'United Kingdom');
    }
    if ($scope.selectedBankCountry.name !== 'Denmark' && $scope.selectedBankCountry.name !== 'United Kingdom') {
      $scope.showBankName = false;
      $scope.showDanish = false;
      $scope.britishBank = false;
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

  $scope.qa.ukInfo = () => {
    $scope.$parent.bankAccount = {
      account: {
        bic: 'NWBK',
        number: 'GB29 NWBK 6016 1331 9268 19',
        currency: $scope.trade.quoteCurrency
      },
      bank: {
        name: 'Gringotts',
        address: {
          street: '1 Main St',
          city: 'London',
          state: null,
          zipcode: '11111',
          country: 'GB'
        }
      },
      holder: {
        name: 'Harry Potter',
        address: {
          street: '4 Privet Drive',
          zipcode: '22222',
          city: 'London',
          state: '',
          country: 'GB'
        }
      }
    };
  };

  $scope.qa.dkInfo = () => {
    $scope.$parent.bankAccount = {
      account: {
        bic: '0040',
        number: '0040 0440 1162 43',
        currency: $scope.trade.quoteCurrency
      },
      bank: {
        address: {
          country: 'DK'
        }
      },
      holder: {
        name: 'Viggo Mortensen',
        address: {
          street: '1 Main St',
          zipcode: '22222',
          city: 'Copenhagen',
          state: '',
          country: 'DK'
        }
      }
    };
  };

  $scope.qa.sepaInfo = () => {
    $scope.$parent.bankAccount = {
      account: {
        bic: '37040044',
        number: 'DE89 3704 0044 0532 0130 00',
        currency: $scope.trade.quoteCurrency
      },
      bank: {
        address: {
          country: 'DE'
        }
      },
      holder: {
        name: 'Ludwig van Beethoven',
        address: {
          street: '1 Main St',
          zipcode: '22222',
          city: 'Berlin',
          state: '',
          country: 'DE'
        }
      }
    };
  };

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
