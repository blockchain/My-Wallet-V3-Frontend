function routes ($stateProvider) {
  'ngInject';
  $stateProvider
    .state('address-book-entry',
    {
      url: '/address-book-entry/:scenarioId',
      parent: 'directives',
      views: {
        'content': {
          component: 'addressBookEntryPage'
        }
      }
    });
}

export default routes;
