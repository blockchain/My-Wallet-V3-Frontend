require('./plaid.scss');

const modules = [
  'ngSanitize',
  'ngRoute'
];

import MainController from './main.controller';
import PlaidController from './plaid.controller';
import RoutesConfig from './routes.config';

angular
  .module('plaid', modules)
  .controller('MainController', MainController)
  .controller('PlaidController', PlaidController)
  .config(RoutesConfig)
  .config(($locationProvider) => {
    $locationProvider.html5Mode(true);
  });
