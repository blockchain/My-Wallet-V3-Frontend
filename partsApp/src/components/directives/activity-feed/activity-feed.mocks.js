
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

function buyStatus () {
  function canBuy () { return new Promise(() => {}); }

  return {
    canBuy: canBuy
  };
}

export default {
  Activity: Activity,
  Wallet: Wallet,
  MyWallet: MyWallet,
  buyStatus: buyStatus
};
