import './app.scss';

import angular from 'npm/angular';
import uiRouter from 'npm/angular-ui-router';

import routing from './app.routes.js';
import Adverts from './pages/adverts';
import Components from './pages/components';
import Directives from './pages/directives';
import Home from './pages/home';

const modules = [
  uiRouter,
  Adverts,
  Home,
  Components,
  Directives
];

angular
  .module('app', modules)
  .config(routing);
