angular
  .module('walletFilters')
  .filter('addressOrNameMatch', addressOrNameMatchFilter);

function addressOrNameMatchFilter () {
  return function (addresses, q) {
    if (q == null || q === '') return addresses;
    q = q.toLowerCase();
    return addresses.filter(function (addr) {
      let keep;
      keep = addr.account != null && addr.account.label.toLowerCase().indexOf(q) > -1;
      keep = keep || (addr.label != null) && addr.label.toLowerCase().indexOf(q) > -1;
      keep = keep || addr.address.toLowerCase().indexOf(q) > -1;
      return keep;
    });
  };
}
