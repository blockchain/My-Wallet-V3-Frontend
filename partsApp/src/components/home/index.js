// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';
import ngResource from 'npm/angular-resource';
// Internal resources
import routes from './home.routes.js';
import HomeController from './home.controller.js';
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
  .module('app.pages.home', modules)
  .config(routes)
  .controller('HomeController', HomeController)
  .name;
