module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-ui-router/release/angular-ui-router.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-ui-select/dist/select.js',
      'app/bower_components/angular-audio/app/angular.audio.js',
      'app/bower_components/qrcode/lib/qrcode.min.js',
      'app/bower_components/angular-qr/angular-qr.min.js',
      'app/bower_components/angular-local-storage/dist/angular-local-storage.min.js',
      'app/bower_components/numeral/numeral.js',
      'app/bower_components/angular-numeraljs/dist/angular-numeraljs.js',
      'app/bower_components/angular-translate/angular-translate.js',
      'assets/js/app.js.coffee',
      'assets/js/controllers/*.js.coffee',
      'assets/js/filters.js.coffee',
      'assets/js/services/*.js.coffee',
      'tests/**/*.coffee',
      'tests/**/*.js'      
    ],

    autoWatch : true,

    preprocessors: {
      '**/*.coffee': ['coffee']
    },

    coffeePreprocessor: {
      // options passed to the coffee compiler
      options: {
        bare: true,
        sourceMap: true
      },
      // transforming the filenames
      transformPath: function(path) {
        return path.replace(/\.coffee$/, '.js');
      }
    },

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],

    plugins : [
            'karma-coffee-preprocessor',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};