
function Alerts () {
  function fetchOnce () {}

  return {
    ads: [],
    fetchOnce: fetchOnce
  };
}

function Wallet () {
  return {
    status: {
      isLoggedIn: true
    }
  };
}

export default {
  Alerts: Alerts,
  Wallet: Wallet
};
