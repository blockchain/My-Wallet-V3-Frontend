
angular
  .module('walletApp')
  .factory('format', format);

format.$inject = [];

function format () {
  let defineIn = obj => (prop, get) => (
    Object.defineProperty(obj, prop, { configurable: false, get })
  );

  const service = {
    origin: originDestination,
    destination: originDestination,
    addressBook: addressBook
  };

  return service;

  function originDestination (o) {
    let formatted = {
      label: o.label || o.address,
      index: o.index,
      address: o.address
    };

    let def = defineIn(formatted);
    def('balance', () => o.balance);
    def('archived', () => o.archived);

    formatted.type = o.index != null ? 'Accounts' : 'Imported Addresses';
    if (o.index == null) formatted.isWatchOnly = o.isWatchOnly;
    else formatted.xpub = o.extendedPublicKey;
    return formatted;
  }

  function addressBook (o) {
    return {
      label: o.label,
      address: o.address,
      type: 'Address Book'
    };
  }
}
