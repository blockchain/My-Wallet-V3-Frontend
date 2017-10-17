angular
  .module('walletApp')
  .component('exchangeRecurring', {
    bindings: {
      trade: '<t',
      dollars: '<',
      frequency: '<'
    },
    templateUrl: 'templates/exchange/recurring.pug',
    controller: ExchangeRecurringController,
    controllerAs: '$ctrl'
  });

function ExchangeRecurringController ($scope, currency) {
  $scope.date = new Date();
  $scope.format = currency.formatCurrencyForView;

  let frequency = this.frequency;
  let human = { 1: 'st', 2: 'nd', 3: 'rd', 21: 'st', 22: 'nd', 23: 'rd', 31: 'st' };
  let days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  if (frequency === 'Daily') $scope.timespan = '24 hours';
  if (frequency === 'Weekly') $scope.timespan = `${days[$scope.date.getDay()]}`;
  if (frequency === 'Monthly') $scope.timespan = `${$scope.date.getDate() + (human[$scope.date.getDate()] || 'th')} of the month`;
}
