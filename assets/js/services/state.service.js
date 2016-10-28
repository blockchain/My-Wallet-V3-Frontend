angular
  .module('walletApp')
  .factory('state', state);

state.$inject = [];

function state () {
  const stateCodes = [{'Name': 'Alabama', 'Code': 'AL'},
                      {'Name': 'Alaska', 'Code': 'AK'},
                      {'Name': 'American Samoa', 'Code': 'AS'},
                      {'Name': 'Arizona', 'Code': 'AZ'},
                      {'Name': 'Arkansas', 'Code': 'AR'},
                      {'Name': 'California', 'Code': 'CA'},
                      {'Name': 'Colorado', 'Code': 'CO'},
                      {'Name': 'Connecticut', 'Code': 'CT'},
                      {'Name': 'Delaware', 'Code': 'DE'},
                      {'Name': 'District Of Columbia', 'Code': 'DC'},
                      {'Name': 'Federated States Of Micronesia', 'Code': 'FM'},
                      {'Name': 'Florida', 'Code': 'FL'},
                      {'Name': 'Georgia', 'Code': 'GA'},
                      {'Name': 'Guam', 'Code': 'GU'},
                      {'Name': 'Hawaii', 'Code': 'HI'},
                      {'Name': 'Idaho', 'Code': 'ID'},
                      {'Name': 'Illinois', 'Code': 'IL'},
                      {'Name': 'Indiana', 'Code': 'IN'},
                      {'Name': 'Iowa', 'Code': 'IA'},
                      {'Name': 'Kansas', 'Code': 'KS'},
                      {'Name': 'Kentucky', 'Code': 'KY'},
                      {'Name': 'Louisiana', 'Code': 'LA'},
                      {'Name': 'Maine', 'Code': 'ME'},
                      {'Name': 'Marshall Islands', 'Code': 'MH'},
                      {'Name': 'Maryland', 'Code': 'MD'},
                      {'Name': 'Massachusetts', 'Code': 'MA'},
                      {'Name': 'Michigan', 'Code': 'MI'},
                      {'Name': 'Minnesota', 'Code': 'MN'},
                      {'Name': 'Mississippi', 'Code': 'MS'},
                      {'Name': 'Missouri', 'Code': 'MO'},
                      {'Name': 'Montana', 'Code': 'MT'},
                      {'Name': 'Nebraska', 'Code': 'NE'},
                      {'Name': 'Nevada', 'Code': 'NV'},
                      {'Name': 'New Hampshire', 'Code': 'NH'},
                      {'Name': 'New Jersey', 'Code': 'NJ'},
                      {'Name': 'New Mexico', 'Code': 'NM'},
                      {'Name': 'New York', 'Code': 'NY'},
                      {'Name': 'North Carolina', 'Code': 'NC'},
                      {'Name': 'North Dakota', 'Code': 'ND'},
                      {'Name': 'Northern Mariana Islands', 'Code': 'MP'},
                      {'Name': 'Ohio', 'Code': 'OH'},
                      {'Name': 'Oklahoma', 'Code': 'OK'},
                      {'Name': 'Oregon', 'Code': 'OR'},
                      {'Name': 'Palau', 'Code': 'PW'},
                      {'Name': 'Pennsylvania', 'Code': 'PA'},
                      {'Name': 'Puerto Rico', 'Code': 'PR'},
                      {'Name': 'Rhode Island', 'Code': 'RI'},
                      {'Name': 'South Carolina', 'Code': 'SC'},
                      {'Name': 'South Dakota', 'Code': 'SD'},
                      {'Name': 'Tennessee', 'Code': 'TN'},
                      {'Name': 'Texas', 'Code': 'TX'},
                      {'Name': 'Utah', 'Code': 'UT'},
                      {'Name': 'Vermont', 'Code': 'VT'},
                      {'Name': 'Virgin Islands', 'Code': 'VI'},
                      {'Name': 'Virginia', 'Code': 'VA'},
                      {'Name': 'Washington', 'Code': 'WA'},
                      {'Name': 'West Virginia', 'Code': 'WV'},
                      {'Name': 'Wisconsin', 'Code': 'WI'},
                      {'Name': 'Wyoming', 'Code': 'WY'}];

  const service = {
    stateCodes: stateCodes
  };

  return service;
}
