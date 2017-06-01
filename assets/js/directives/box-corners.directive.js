angular
  .module('walletApp')
  .directive('boxCorners', boxCorners);

let createCorner = (classes) => {
  let div = angular.element('<div></div>');
  div.addClass('box-corner');
  classes.forEach(c => div.addClass(c));
  return div;
};

function boxCorners () {
  return {
    restrict: 'A',
    link
  };

  function link (scope, elem, attrs) {
    let appendCorners = () => {
      elem.querySelectorAll('.box-corner').remove();
      if (!attrs.boxCorners) return;
      let color = attrs.boxCorners;
      elem.append(createCorner(['top', 'left', color]));
      elem.append(createCorner(['top', 'right', color]));
      elem.append(createCorner(['bottom', 'right', color]));
      elem.append(createCorner(['bottom', 'left', color]));
    };

    elem.css('position', 'relative');
    scope.$watch(() => attrs.boxCorners, appendCorners);
  }
}
