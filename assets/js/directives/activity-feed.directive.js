
angular
  .module('walletDirectives')
  .directive('activityFeed', activityFeed);

activityFeed.$inject = ['$http', 'Wallet', 'Activity'];

function activityFeed ($http, Wallet, Activity) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/activity-feed.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.status = Wallet.status;
    scope.activities = Activity.activities;
    scope.loading = true;

    scope.$watch(() => Activity.activities, (activities) => {
      scope.activities = activities;
    });

    scope.$watch('status.didLoadTransactions', (didLoad) => {
      if (didLoad) scope.loading = false;
    });

    scope.$watch('status.didLoadSettings', (didLoad) => {
      if (didLoad) Activity.updateLogActivities();
    });
  }
}
