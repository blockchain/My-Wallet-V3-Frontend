angular
  .module('walletDirectives')
  .directive('popup', popup);

function popup (modals, $translate) {
  const directive = {
    restrict: 'A',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    let open = () => {
      let options = { windowClass: 'bc-modal sm' };

      modals.openTemplate('partials/popup-modal.pug', {
        days: attrs.popupDays,
        name: attrs.popupName,
        icon: $translate.instant(attrs.popupName + '.ICON')
      }, options);
    };

    elem.on('click', open);
  }
}
