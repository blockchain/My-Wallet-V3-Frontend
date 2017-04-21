angular
  .module('walletFilters')
  .filter('getByProperty', getByPropertyFilter);

function getByPropertyFilter () {
  return function (propertyName, propertyValue, collection) {
    let i = 0;
    let len = collection.length;
    while (i < len) {
      if (collection[i][propertyName] === propertyValue) {
        return collection[i];
      }
      i++;
    }
    return null;
  };
}
