angular
  .module('walletApp')
  .controller('CoinifyBankLinkController', CoinifyBankLinkController);

function CoinifyBankLinkController ($scope, Alerts, buySell) {
  console.log('bank link scope', $scope)
  // $scope.$parent.getBankAccounts();
  // load fake account
  $scope.$parent.bankAccounts = [{
    "id": 12345, // Identifier of the bank account
    "account": {
      "type": "sepa", // Type of bank account
      "currency": "EUR", // Currency of the bank account
      "bic": "6456", // Account bic/swift/reg number depending on the type
      "number": "987654321" // Account number
    },
    "bank": {
      "name": "Bank of Coinify",
      "address": { // Address of the bank
        "country": "FR"
      }
    },
    "holder": {
      "name": "John Doe", // Name of the account holder
      "address": { // Address of the account holder
        "street": "123 Example Street",
        "zipcode": "12345",
        "city": "Exampleville",
        "state": "CA",
        "country": "US"
      }
    },
    "update_time": "2016-04-01T12:27:36Z",
    "create_time": "2016-04-01T12:23:19Z"
  },
  {
    "id": 12345,
    "account": {
      "type": "sepa",
      "currency": "EUR",
      "bic": "6456",
      "number": "123456789"
    },
    "bank": {
      "name": "Bank of Satoshi",
      "address": {
        "country": "FR"
      }
    },
    "holder": {
      "name": "John Smith",
      "address": {
        "street": "123 Example Street",
        "zipcode": "12345",
        "city": "Exampleville",
        "state": "CA",
        "country": "US"
      }
    },
    "update_time": "2016-04-01T12:27:36Z",
    "create_time": "2016-04-01T12:23:19Z"
  }]

  $scope.selecting = true;


  $scope.bankLinkEdit = () => $scope.selecting = !$scope.selecting;

  $scope.addBankAccount = () => {

  };

  $scope.deleteAccount = (account) => {
    console.log('delete account with', account)
  };

}
