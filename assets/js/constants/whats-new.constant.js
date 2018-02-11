angular.module('walletApp')
.constant('whatsNew', [
  { title: 'MEW.import_funds_mew', desc: 'MEW.import_funds_explain', date: new Date('Feb 10 2018'), ref: 'wallet.common.settings.info' },
  { title: 'SFOX.BUY_BITCOIN', desc: 'SFOX.BUY_BITCOIN_EXPLAIN', date: new Date('Feb 08 2018'), ref: 'wallet.common.buy-sell' },
  { title: 'BITCOIN_CASH.ADDRESSES', desc: 'BITCOIN_CASH.ADDR_FORMAT', date: new Date('Jan 18 2018'), ref: 'wallet.common.faq' },
  { title: 'SFOX.SELL_BITCOIN', desc: 'SELL_BITCOIN_EXPLAIN', date: new Date('Dec 15 2017'), ref: 'wallet.common.buy-sell' },
  { title: 'BITCOIN_CASH.TITLE', 'desc': 'BITCOIN_CASH.WHATS_NEW', date: new Date('December 12 2017'), ref: 'wallet.common.bch.transactions' },
  // { title: 'RECURRING_BUY', 'desc': 'RECURRING_BUY_WHATS_NEW', date: new Date('November 16 2017'), ref: 'wallet.common.buy-sell' },
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
