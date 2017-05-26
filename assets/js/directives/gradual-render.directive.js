
angular
  .module('walletDirectives')
  .directive('gradualRender', gradualRender);

function gradualRender () {
  return {
    restrict: 'AE',
    controllerAs: '$render',
    controller: gradualRenderController
  };
}

function gradualRenderController () {
  const defaultStartCount = 20;
  const defaultStepSize = 10;
  this.limit = defaultStartCount;
  this.next = () => { this.limit += defaultStepSize; };
}
