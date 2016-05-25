angular
  .module('walletApp')
  .directive('paymentRequests', paymentRequests);

function paymentRequests ($uibModal, Wallet) {
  const directive = {
    restrict: 'E',
    template: `
      <div class="payment-requests" ng-show="paymentRequests.length > 0">
        <h4>Payment Requests:</h4>
        <div class="payment-request" ng-click="openPR(pr); close(pr)" ng-repeat="pr in paymentRequests">
          <span>From: {{::pr.email}}</span>
          <i class="ti-close close" ng-click="close(pr)"></i>
        </div>
      </div>
    `,
    link: link
  };
  return directive;

  function link (scope) {
    scope.openPR = (pr) => $uibModal.open({
      templateUrl: 'partials/send.jade',
      windowClass: 'bc-modal initial',
      controller: 'SendCtrl',
      resolve: { paymentRequest: () => pr }
    });

    scope.close = (pr) => {
      let index = scope.paymentRequests.indexOf(pr);
      scope.paymentRequests.splice(index, index + 1);
      Wallet.deletePaymentRequest(pr);
    };

    scope.$watch(
      () => Wallet.paymentRequests,
      (prs) => scope.paymentRequests = prs
    );
  }
}
