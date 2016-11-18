'use strict';

angular
  .module('partsApp')
  .factory('Wallet', Wallet);

Wallet.$inject = [];

function Wallet () {
  const service = {
    status: {
      isLoggedIn: true
    }
  };
  console.info('Mock Wallet Service');
  return service;
}

angular
  .module('partsApp')
  .factory('Activity', Activity);

Activity.$inject = ['$timeout', 'Wallet'];

function Activity ($timeout, Wallet) {
  const service = {
    activities: [],
    updateLogActivities: () => {}
  };
  console.info('Mock Activity Service');

  $timeout(() => {
    Wallet.status.didLoadTransactions = true;
    Wallet.status.didLoadSettings = true;

    service.activities.push({
      title: 'TRANSACTION',
      icon: 'ti-layout-list-post',
      time: 1450000000000,
      message: 'SENT',
      amount: 1481599,
      labelClass: 'received',
      type: 0
    });

    service.activities.push({
      amount: 1481599,
      icon: 'ti-layout-list-post',
      labelClass: 'received',
      message: 'BOUGHT',
      time: 1479202339000,
      title: 'TRANSACTION',
      type: 0
    });
  }, 1000);

  return service;
}
