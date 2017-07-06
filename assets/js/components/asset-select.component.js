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

function AssetSelectController () {
  this.assets = [
    { name: 'Bitcoin', code: 'btc', icon: 'icon-bitcoin' },
    { name: 'Ether', code: 'eth', icon: 'icon-ethereum' }
  ];

  this.onChange = (asset) => {
    this.onSelect({ asset });
  };
}
