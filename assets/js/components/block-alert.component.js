/* eslint-disable semi */
angular
  .module('walletApp')
  .component('blockAlert', {
    bindings: {
      config: '<',
      showIcon: '<'
    },
    templateUrl: 'templates/block-alert.pug',
    controller: BlockAlertController
  })

function BlockAlertController (languages, localStorageService, blockAlert) {
  this.iconTypes = {
    'info': 'icon-success',
    'warning': 'icon-alert',
    'danger': 'icon-build'
  }
  if (blockAlert.isValidConfig(this.config)) {
    this.alert = blockAlert.localizeConfig(languages.get(), this.config)
    this.dismissable = this.alert.dismissId != null

    if (this.dismissable) {
      this.storageId = `dismissed-block-alert-id:${this.alert.dismissId}`
      this.dismissed = localStorageService.get(this.storageId)
      this.dismiss = () => {
        this.dismissed = true
        localStorageService.set(this.storageId, true)
      }
    }
  } else {
    console.warn('block-alert received invalid config:', this.config)
  }
}
