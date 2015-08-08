describe('block-tor', function() {
  // Required JS files
  var login = require('../ignore.js');
  var util = require('../util.js');


  beforeEach(function() {
      util.getURL();
      util.logIn();
      util.navigateTo("SECURITY");
      browser.sleep(4000);
      browser.findElement(by.cssContainingText('.ng-binding', 'Tor Blocked')).isDisplayed().then(function(result) {
        if (result) {
          util.navigateTo("SETTINGS");
          util.navigateTo("ADVANCED");
          browser.sleep(1000);//wait for animation
          browser.findElement(by.css('[translate="DISABLE_BLOCK_TOR"]')).click();
          browser.findElement(by.css('[translate="HOME"]')).click();
          util.navigateTo("SECURITY");
        }
        else {
          util.navigateTo("SECURITY");
        }
      });
  });

  afterEach(function() {

      browser.refresh();

  });

  it('should be able to block tor', function() {


      browser.findElement(by.css('[translate="ADD_BLOCK_TOR"]')).click();
      browser.findElement(by.css('[translate="BLOCK_TOR_EXPLAIN"]'))

      //enable the button
      browser.findElement(by.css('[ng-click="enableBlockTOR()"]')).click();

      //wait for animation to complete
      browser.sleep(2000);
      browser.findElement(by.cssContainingText('.ng-binding', 'Tor Blocked'))
  });

});

