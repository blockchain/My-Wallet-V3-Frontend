angular
  .module('walletApp')
  .factory('assetContext', AssetContextService);

function AssetContextService ($state, Wallet, Ethereum) {
  const service = {};

  service.getAssets = () => [
    { name: 'Bitcoin', code: 'btc', icon: 'icon-bitcoin' },
    { name: 'Ether', code: 'eth', icon: 'icon-ethereum' }
  ];

  service.hasBtcBalance = () => Wallet.total() > 0;
  service.hasEthBalance = () => Ethereum.balance > 0;

  service.isViewingBtc = () => $state.current.name.includes('btc');
  service.isViewingEth = () => $state.current.name.includes('eth');

  service.getContext = () => {
    let hasBtc = service.hasBtcBalance();
    let hasEth = service.hasEthBalance();
    let viewBtc = service.isViewingBtc();
    let viewEth = service.isViewingEth();

    if (!hasEth) {
      if (viewEth) return { available: ['btc', 'eth'], defaultTo: 'eth', balance: 'both' };
      return { available: ['btc'], defaultTo: 'btc', balance: 'btc' };
    }
    if (hasBtc && hasEth) {
      if (viewEth) return { available: ['btc', 'eth'], defaultTo: 'eth', balance: 'all' };
      return { available: ['btc', 'eth'], defaultTo: 'btc', balance: 'all' };
    }
    if (hasEth && !hasBtc) {
      if (viewBtc) return { available: ['btc', 'eth'], defaultTo: 'btc', balance: 'both' };
      return { available: ['btc', 'eth'], defaultTo: 'eth', balance: 'eth' };
    }
  };

  return service;
}
