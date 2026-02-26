angular
  .module('walletFilters')
  .filter('getByPropertyNested', getByPropertyNestedFilter);

function getByPropertyNestedFilter () {
  return function (propertyName, propertyValue, collection) {
    let i = 0;
    let len = collection.length;
    while (i < len) {
      let subCollection = collection[i][propertyName];
      let j = 0;
      let len2 = subCollection.length;
      while (j < len2) {
        if (collection[i][propertyName][j] === propertyValue) {
          return collection[i];
        }
        j++;
      }
      i++;
    }
    return null;
  };
}
