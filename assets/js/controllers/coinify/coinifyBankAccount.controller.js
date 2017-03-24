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

  $scope.setAccountType = (accountType) => {
    $scope.accountType = accountType;
  };

  $scope.selectCountry = (type, country) => {
    $scope.selectedBankCountry = country.name;
    if (type === 'bank') {
      $scope.$parent.bankAccount.bank.address.country = country.code;
      $scope.$parent.country = country.name;
    } else if (type === 'holder') {
      $scope.$parent.bankAccount.holder.address.country = country.code;
    }
  };

  const setAccountTypeHelper = (countryCode, countryName) => {
    $scope.$parent.bankAccount.holder.address.country = countryCode;
    $scope.$parent.bankAccount.bank.address.country = countryCode;
    $scope.$parent.country = countryName;
  };

  $scope.setAccountType = (tx) => {
    if (tx.currency === 'DKK') {
      $scope.showDanish = true;
      $scope.showBankName = false;
      setAccountTypeHelper('DK', 'Denmark');
    }
    if (tx.currency === 'EUR') {
      $scope.showBankName = false;
    }
    if (tx.currency === 'GBP') {
      $scope.britishBank = true;
      setAccountTypeHelper('GB', 'United Kingdom');
    }
  };
  $scope.setAccountType($scope.transaction);

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
          street: '1 Tea St',
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
    }
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
          street: '1 Danish Way',
          zipcode: '22222',
          city: 'Copenhagen',
          state: '',
          country: 'DK'
        }
      }
    }
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
          street: '1 Germany Way',
          zipcode: '22222',
          city: 'Berlin',
          state: '',
          country: 'DE'
        }
      }
    }
  };

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
