// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/@uirouter/angularjs';
import ngResource from 'npm/angular-resource';
// Internal resources
import routes from './home.routes.js';
import Home from './home.component.js';
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
  .module('app.home', modules)
  .config(routes)
  .component('home', Home)
  .name;
