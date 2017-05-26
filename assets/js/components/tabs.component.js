/* eslint-disable semi */
angular
  .module('walletApp')
  .component('bcTabs', {
    bindings: {
      tab: '<',
      tabOptions: '<',
      disabled: '<',
      badge: '<',
      onSelect: '&'
    },
    transclude: true,
    templateUrl: 'templates/bc-tabs.pug',
    controller: BcTabsController
  })

function BcTabsController () {
  const state = this.state = { expanded: false }
  this.toggleExpanded = () => { state.expanded = !state.expanded }

  this.selectTab = (tab) => {
    state.expanded = false
    this.onSelect({ $tab: tab })
  }

  this.moveTab = (offset) => (event) => {
    let nextTab = this.tabOptions[this.tabOptions.indexOf(this.tab) + offset]
    if (nextTab) this.selectTab(nextTab)
  }

  this.$onChanges = ({ tab }) => {
    if (tab && tab.currentValue == null) {
      console.warn('bc-tabs component was passed undefined tab state')
    }
  }
}
