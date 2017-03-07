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

    elem.on('blur', () => {
      let data = [fieldId, ctrl.$viewValue].join()
      buyMobile.callMobileInterface(buyMobile.AMOUNT_FIELD_BLURRED, data)
    })

    ctrl.$viewChangeListeners.push(() => {
      if (elem[0] === document.activeElement) {
        let data = [fieldId, ctrl.$viewValue].join()
        buyMobile.callMobileInterface(buyMobile.AMOUNT_FIELD_CHANGED, data)
      }
    })

    scope.$on('nativeKeyboardInput', (event, input, field) => {
      if (field === fieldId) {
        ctrl.$setViewValue(input)
        ctrl.$render()
      }
    })
  }
}
