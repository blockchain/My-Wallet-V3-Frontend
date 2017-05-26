// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/@uirouter/angularjs';
import ngResource from 'npm/angular-resource';
// Internal resources
import LeftNavbar from './leftNavbar.component.js';

const modules = [
  uiRouter,
  ngResource
];

export default angular
  .module('app.shared.leftNavbar', modules)
  .component('leftNavbar', LeftNavbar)
  .name;
