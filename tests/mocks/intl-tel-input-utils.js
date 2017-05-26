window.intlTelInputUtils = {
  isValidNumber (number) {
    if (number === '+31') {
      return false;
    } else {
      return true;
    }
  },
  formatNumber (number) {
    return number;
  }
};
