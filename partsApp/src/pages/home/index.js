import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';

import routes from './home.routes.js';
import HomeController from './home.controller.js';
import headerDirective from 'components/header';

const modules = [
  uiRouter,
  ngResource,
  headerDirective
];

export default angular
  .module('app.pages.home', modules)
  .config(routes)
  .controller('HomeController', HomeController)
  .name;
