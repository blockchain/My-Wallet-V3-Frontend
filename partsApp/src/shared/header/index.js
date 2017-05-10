// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
// import HeaderDirective from './header.directive.js';
import Header from './header.component.js';

const modules = [
  uiRouter,
  ngResource
];

export default angular
  .module('app.components.header', modules)
  // .directive('headerDirective', () => new HeaderDirective())
  .component('header', Header)
  .name;
