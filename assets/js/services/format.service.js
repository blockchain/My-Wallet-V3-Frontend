
angular
  .module('walletApp')
  .factory('format', format);

format.$inject = [];

function format () {
  const service = {
    origin: originDestination,
    destination: originDestination,
    addressBook: addressBook
  };

  return service;

  function originDestination (o) {
    const formatted = {
      label: o.label || o.address,
      index: o.index,
      address: o.address,
      balance: o.balance,
      archived: o.archived
    };
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
