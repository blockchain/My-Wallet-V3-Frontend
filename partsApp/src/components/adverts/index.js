// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import routes from './adverts.routes.js';
import AdvertsController from './adverts.controller.js';
// External resources
import headerDirective from 'shared/header';

const modules = [
  uiRouter,
  ngResource,
  headerDirective
];

export default angular
  .module('app.pages.adverts', modules)
  .config(routes)
  .controller('AdvertsController', AdvertsController)
  .name;
