// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import routes from './directives.routes.js';
import DirectivesController from './directives.controller.js';
// External resources
import header from 'shared/header';
import leftNavbar from 'shared/leftNavbar';

const modules = [
  uiRouter,
  ngResource,
  header,
  leftNavbar
];

export default angular
  .module('app.pages.directives', modules)
  .config(routes)
  .controller('DirectivesController', DirectivesController)
  .name;
