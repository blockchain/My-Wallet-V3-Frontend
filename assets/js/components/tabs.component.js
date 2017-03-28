/* eslint-disable semi */
angular
  .module('walletApp')
  .component('bcTabs', {
    bindings: {
      tab: '<',
      tabOptions: '<',
      onSelect: '&'
    },
    transclude: true,
    templateUrl: 'templates/bc-tabs.pug',
    controller: BcTabsController
  })

function BcTabsController () {
  this.moveTab = (offset) => (event) => {
    let nextTab = this.tabOptions[this.tabOptions.indexOf(this.tab) + offset];
    if (nextTab) this.onSelect({ $tab: nextTab });
  };
}
