/* eslint-disable semi */
angular
  .module('walletApp')
  .directive('nativeKeyboard', nativeKeyboard)

function nativeKeyboard (buyMobile) {
  return {
    scope: false,
    restrict: 'A',
    require: 'ngModel',
    link
  }

  function link (scope, elem, attrs, ctrl) {
    let fieldId = `${ctrl.$$parentForm.$name}.${ctrl.$name}`

    elem.on('focus', () => {
      buyMobile.callMobileInterface(buyMobile.AMOUNT_FIELD_FOCUSED, fieldId)
    })

    scope.$on('nativeKeyboardInput', (event, input, field) => {
      if (field === fieldId) {
        ctrl.$setViewValue(input)
        ctrl.$render()
      }
    })
  }
}
