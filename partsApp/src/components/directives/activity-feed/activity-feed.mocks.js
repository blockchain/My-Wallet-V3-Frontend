
function Activity () {
  return {
    activities: []
  };
}

function Wallet () {
  return {
    status: {
      isLoggedIn: true
    }
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
