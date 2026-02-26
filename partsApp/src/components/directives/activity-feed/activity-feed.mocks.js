
function Activity () {
  return {
    activities: []
  };
}

function Wallet ($timeout) {
  this.status = {
    isLoggedIn: true,
    didLoadTransactions: false
  };

  $timeout(() => {
    this.status.didLoadTransactions = true;
  }, 1000);

  return {
    status: this.status
  };
}

function MyWallet () {
  return {
  };
}

function tradeStatus () {
  function canTrade () { return new Promise(() => {}); }

  return {
    canTrade: canTrade
  };
}

export default {
  Activity: Activity,
  Wallet: Wallet,
  MyWallet: MyWallet,
  tradeStatus: tradeStatus
};
