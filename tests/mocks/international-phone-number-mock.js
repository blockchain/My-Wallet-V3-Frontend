angular.module('internationalPhoneNumber', []).directive('internationalPhoneNumber', () =>

  ({
    restrict: 'A',
    require: '^ngModel',
    scope: {
      ngModel: '=',
      defaultCountry: '@'
    },

    link (scope, element, attrs, ctrl) {}
  })
);
