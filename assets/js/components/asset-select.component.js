angular
  .module('walletApp')
  .component('assetSelect', {
    bindings: {
      asset: '<',
      onSelect: '&'
    },
    templateUrl: 'templates/asset-select.pug',
    controller: AssetSelectController
  });

function AssetSelectController (assetContext) {
  this.assets = assetContext.getAssets();

  this.onChange = (asset) => {
    this.onSelect({ asset });
  };
}
