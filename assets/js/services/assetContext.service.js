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

  service.isViewingBtc = () => $state.current.indexOf('wallet.common.btc') === 0;
  service.isViewingEth = () => $state.current.indexOf('wallet.common.eth') === 0;

  service.shouldShowBalanceFor = (assetCode) => (
    service.getBalanceContext().indexOf(assetCode) > 0
  );

  service.getBalanceContext = () => {
    let hasBtc = service.hasBtcBalance();
    let hasEth = service.hasEthBalance();
    let viewBtc = service.isViewingBtc();
    let viewEth = service.isViewingEth();

    if (hasBtc && hasEth) {
      return ['btc', 'eth'];
    }
    if (hasBtc && !hasEth) {
      if (viewEth) return ['btc', 'eth'];
      return ['btc'];
    }
    if (hasEth && !hasBtc) {
      if (viewBtc) return ['btc', 'eth'];
      return ['eth'];
    }
    if (!hasBtc && !hasEth) {
      if (viewEth) return ['btc', 'eth'];
      return ['btc'];
    }
  };

  return service;
}
