// Packages
import angular from 'npm/angular';
import uiRouter from 'npm/@uirouter/angularjs';
import ngResource from 'npm/angular-resource';
import ngTranslate from 'npm/angular-translate';
// Internal resources
import routes from './address-book-entry.routes.js';
import AddressBookEntryPage from './address-book-entry.component.js';
import Mocks from './address-book-entry.mocks.js';
// External resources
import ScenarioMenu from 'shared/scenarioMenu';
// Wallet resources
import 'walletJs/walletDirectives.js';
import 'walletJs/templates.js';
import 'walletJs/directives/address-book-entry.directive.js';

const modules = [
  uiRouter,
  ngResource,
  ngTranslate,
  ScenarioMenu,
  'walletDirectives',
  'templates-main'
];

export default angular
  .module('app.directives.address-book-entry', modules)
  .config(routes)
  .factory('Alerts', Mocks.Alerts)
  .factory('Wallet', Mocks.Wallet)
  .component('addressBookEntryPage', AddressBookEntryPage)
  .name;
