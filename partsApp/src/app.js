import './app.scss';
import 'walletCss/wallet.css';

import angular from 'npm/angular';
import uiRouter from 'npm/@uirouter/angularjs';

import routing from './app.routes.js';
import Home from 'components/home';
import Components from 'components/components';
import Directives from 'components/directives';

import AddressBookEntry from 'components/directives/address-book-entry';
import ActivityFeed from 'components/directives/activity-feed';
import Adverts from 'components/directives/adverts';

const modules = [
  uiRouter,
  Home,
  Components,
  Directives,
  AddressBookEntry,
  ActivityFeed,
  Adverts
];

angular
  .module('app', modules)
  .config(routing);
