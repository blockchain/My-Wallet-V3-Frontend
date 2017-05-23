
angular
  .module('walletApp')
  .factory('QA', QA);

function QA () {
  const service = {};

  let unique = new Date().getTime().toString();

  service.unocoinAddressForm = () => {
    let fields = {
      fullName: 'Satoshi' + unique + ' Nakamoto',
      street: 'Abc #1024 6th cross Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      zipcode: '560011'
    };

    return fields;
  };

  service.unocoinInfoForm = () => {
    let fields = {
      mobile: unique.slice(0, 10),
      pancard: unique.slice(0, 10),
      bankAccountNumber: unique.slice(0, 4),
      ifsc: 'VYSY0002270'
    };

    return fields;
  };

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

  service.SFOXDebugDocs = ['testing-docs-id', 'testing-docs-address', 'testing-docs-all', 'testing-user-block'];

  return service;
}
