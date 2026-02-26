angular.module('bcPhoneNumber', []).service('bcPhoneNumber', function () {
  this.isValid = () => true;
  this.format = number => number;
});
