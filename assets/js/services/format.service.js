
angular
  .module('walletApp')
  .factory('format', format);

format.$inject = [];

function format () {
  const service = {
    origin: originDestination,
    destination: originDestination
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
    formatted.type = o.index != null ? '' : 'Imported Addresses';
    if (o.index == null) formatted.isWatchOnly = o.isWatchOnly;
    return formatted;
  }
}
