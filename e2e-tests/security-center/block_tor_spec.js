describe('block-tor', function() {
  // Required JS files
  var login = require('../ignore.js');
  var util = require('../util.js');


  beforeEach(function() {

      util.getURL();
      util.logIn();
      util.validateHome();

  });


  it('should have the block tor section', function() {
    //test that there is a block tor section
  });

  it('should successfully block tor when clicking the block tor button', function() {
    //test that the block tor button works
  });

  it('should have a success state once blocked', function() {
    //test that the success state occurs
  });

});

