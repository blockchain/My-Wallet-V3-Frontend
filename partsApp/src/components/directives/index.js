// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import routes from './directives.routes.js';
import Directives from './directives.component.js';
// External resources
import header from 'shared/header';
import leftNavbar from 'shared/leftNavbar';
import adverts from './adverts';

const modules = [
  uiRouter,
  ngResource,
  header,
  leftNavbar,
  adverts
];

export default angular
  .module('app.directives', modules)
  .config(routes)
  .component('directives', Directives)
  .name;
