// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import Header from './header.component.js';

const modules = [
  uiRouter,
  ngResource
];

export default angular
  .module('app.shared.header', modules)
  .component('header', Header)
  .name;
