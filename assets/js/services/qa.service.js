
angular
  .module('walletApp')
  .factory('QA', QA);

function QA () {
  const service = {};

  service.SFOXAddressForm = () => {
    let unique = new Date().getTime().toString();
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

  service.SFOXDebugDocs = ['testing-docs-id', 'testing-docs-address', 'testing-docs-all', 'testing-user-block'];

  return service;
}
