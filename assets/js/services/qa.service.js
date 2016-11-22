
angular
  .module('walletApp')
  .factory('QA', QA);

function QA () {
  const service = {};

  let unique = new Date().getTime().toString();

  service.SFOXAddressForm = () => {
    let fields = {
      first: 'Satoshi' + unique,
      last: 'Nakamoto' + unique,
      ssn: unique.slice(4, 13),
      dob: new Date(1991, 4, 14),
      addr1: '123 Bitcoin Lane',
      addr2: '2',
      city: 'New York City',
      state: {'Code': 'NY', 'Name': 'New York'},
      zipcode: 10028
    };

    return fields;
  };

  return service;
}
