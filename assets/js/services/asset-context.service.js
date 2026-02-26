angular
  .module('walletApp')
  .factory('assetContext', AssetContextService);

function AssetContextService ($state, Wallet, Ethereum, BitcoinCash) {
  const service = {};

  service.getAssets = () => [
    { name: 'Bitcoin', code: 'btc', icon: 'icon-bitcoin' },
    { name: 'Ether', code: 'eth', icon: 'icon-ethereum' },
    { name: 'Bitcoin Cash', code: 'bch', icon: 'icon-bitcoin-cash' }
  ];

  service.hasBtcBalance = () => Wallet.total() > 0;
  service.hasEthBalance = () => Ethereum.balance > 0;
  service.hasBchBalance = () => BitcoinCash.balance > 0;

  service.activeAsset = () => $state.current.name.includes('btc') && 'btc' ||
                              $state.current.name.includes('bch') && 'bch' ||
                              $state.current.name.includes('eth') && 'eth' || null;

  return service;
}
