angular.module('walletApp')
.constant('whatsNew', [
  { title: 'BTC_ETH_EXCHANGE', desc: 'BTC_ETH_EXCHANGE_WHATS_NEW', date: new Date('August 11 2017'), ref: 'wallet.common.shift' },
  { title: 'ETHER_SEND_RECEIVE', desc: 'ETHER_SEND_RECEIVE_WHATS_NEW', date: new Date('July 24 2017'), ref: 'wallet.common.eth.transactions' },
  { title: 'SELL_BITCOIN', desc: 'SELL_BITCOIN_EXPLAIN', date: new Date('May 12 2017'), ref: 'wallet.common.buy-sell' },
  { title: 'BUY_BITCOIN', desc: 'BUY_BITCOIN_EXPLAIN', date: new Date('12/15/2016'), ref: 'wallet.common.buy-sell' },
  { title: 'EXPORT_HISTORY', desc: 'EXPORT_HISTORY_EXPLAIN', date: 1466521300000 },
  { title: 'WHATS_NEW', desc: 'WHATS_NEW_EXPLAIN', date: 1463716800000 },
  { title: 'SIGN_VERIFY', desc: 'SIGN_VERIFY_EXPLAIN', date: 1462161600000 },
  { title: 'TRANSFER_ALL', desc: 'TRANSFER_ALL_EXPLAIN', date: 1461556800000 },
  { title: 'DEV_THEMES', desc: 'DEV_THEMES_EXPLAIN', date: 1474862400000 }
]);
