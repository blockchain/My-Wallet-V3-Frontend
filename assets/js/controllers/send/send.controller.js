angular
  .module('walletApp')
  .controller('SendController', SendController);

function SendController ($uibModalInstance, paymentRequest, asset, assetContext, Wallet, Ethereum, BitcoinCash) {
  let [btc, eth, bch] = [Wallet.total(''), Ethereum.balance, BitcoinCash.balance];
  let currencies = [{code: 'btc', amount: btc}, {code: 'eth', amount: eth}, {code: 'bch', amount: bch}];

  let highest = Math.max.apply(Math, currencies.map(c => c.amount));
  let sendDefault = currencies.filter(c => parseFloat(c.amount) === highest)[0];

  let code = asset && asset.code || assetContext.activeAsset() || (btc === 0 && (eth > 0 || bch > 0) ? sendDefault.code : 'btc');

  this.confirm = false;
  this.paymentRequest = paymentRequest;

  this.showTab = (asset) => this.asset = asset;
  this.onTab = (asset) => asset === this.asset.code;
  this.asset = asset.code ? asset : assetContext.getAssets().filter((a) => a.code === code)[0];

  this.close = (result) => {
    $uibModalInstance.close(result);
  };

  this.dismiss = (reason) => {
    $uibModalInstance.dismiss(reason);
  };

  this.toSendView = () => {
    this.confirm = false;
  };

  this.toConfirmView = () => {
    this.confirm = true;
  };
}
