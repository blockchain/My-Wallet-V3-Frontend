angular.module('walletApp')
.constant('whatsNew', [
  { title: 'BUY_BITCOIN', desc: 'BUY_BITCOIN_EXPLAIN', date: new Date('12/15/2016'), ref: 'wallet.common.buy-sell' },
  { title: 'EXPORT_HISTORY', desc: 'EXPORT_HISTORY_EXPLAIN', date: 1466521300000 },
  { title: 'WHATS_NEW', desc: 'WHATS_NEW_EXPLAIN', date: 1463716800000 },
  { title: 'SIGN_VERIFY', desc: 'SIGN_VERIFY_EXPLAIN', date: 1462161600000 },
  { title: 'TRANSFER_ALL', desc: 'TRANSFER_ALL_EXPLAIN', date: 1461556800000 },
  { title: 'DEV_THEMES', desc: 'DEV_THEMES_EXPLAIN', date: 1474862400000 }
]);
