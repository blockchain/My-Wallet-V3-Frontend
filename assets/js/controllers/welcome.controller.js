angular
  .module('walletApp')
  .controller('WelcomeCtrl', WelcomeCtrl);

function WelcomeCtrl ($scope, $timeout) {
  $scope.scrollTo = (element, to, duration) => {
    let start = element.scrollTop;
    let change = to - start;
    let increment = 20;

    let animateScroll = (elapsedTime) => {
      elapsedTime += increment;
      let position = $scope.easeInOut(elapsedTime, start, change, duration);
      element.scrollTop = position;
      if (elapsedTime < duration) {
        $timeout(() => {
          animateScroll(elapsedTime);
        }, increment);
      }
    };

    animateScroll(0);
  };

  $scope.easeInOut = (currentTime, start, change, duration) => {
    currentTime /= duration / 2;
    if (currentTime < 1) {
      return change / 2 * currentTime * currentTime + start;
    }
    currentTime -= 1;
    return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
  };

  $scope.scroll = (id) => {
    let top = document.getElementById(id).offsetTop;
    $scope.scrollTo(document.body, top, 500);
  };
}
