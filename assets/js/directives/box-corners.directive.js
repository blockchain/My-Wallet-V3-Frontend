angular
  .module('walletApp')
  .directive('boxCorners', boxCorners);

let cornerFactory = (size, stroke, color) => (v, h) => {
  let div = angular.element('<div></div>');
  div.css('width', `${size}px`);
  div.css('height', `${size}px`);
  div.css('position', 'absolute');
  div.css(v, '0px');
  div.css(h, '0px');
  div.css(`border-${v}`, `${stroke}px solid ${color}`);
  div.css(`border-${h}`, `${stroke}px solid ${color}`);
  div.addClass('box-corner');
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
      let createCorner = cornerFactory(40, 2, attrs.boxCorners);
      elem.append(createCorner('top', 'left'));
      elem.append(createCorner('top', 'right'));
      elem.append(createCorner('bottom', 'right'));
      elem.append(createCorner('bottom', 'left'));
    };

    elem.css('position', 'relative');
    scope.$watch(() => attrs.boxCorners, appendCorners);
  }
}
