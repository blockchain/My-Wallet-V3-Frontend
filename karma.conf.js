module.exports = function(config){
  config.set({

    basePath : './',

    files : [
      'app/bower_components/angular/angular.js',
      'app/bower_components/angular-sanitize/angular-sanitize.js',
      'app/bower_components/angular-mocks/angular-mocks.js',
      'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'app/bower_components/angular-cookies/angular-cookies.js',
      'app/bower_components/angular-ui-select/dist/select.js',
      'app/bower_components/angular-audio/app/angular.audio.js',
      'app/bower_components/qrcode/lib/qrcode.min.js',
      'app/bower_components/angular-qr/angular-qr.min.js',
      'app/bower_components/angular-local-storage/dist/angular-local-storage.min.js',
      'app/bower_components/numeral/numeral.js',
      'app/bower_components/angular-numeraljs/dist/angular-numeraljs.js',
      'app/bower_components/angular-inview/angular-inview.js',
      'assets/js/app.js.coffee',
      'assets/js/templates.js',
      'assets/js/controllers/**/*.js.coffee',
      'assets/js/filters.js.coffee',
      'assets/js/services/*.js.coffee',
      'assets/js/directives/*.js.coffee',
      'tests/**/*.coffee',
      'tests/**/*.js',
      'app/templates/*.jade',
      'app/bower_components/angular-password-entropy/password-entropy.js',
    ],

    autoWatch : true,

    preprocessors: {
      '**/*.jade': ['ng-jade2js'],
      'assets/js/controllers/**/*.js.coffee' : ['coverage'],
      'assets/js/filters.js.coffee' : ['coverage'], 
      'assets/js/services/*.js.coffee' : ['coverage'],
      'assets/js/directives/*.js.coffee' : ['coverage'],
      'assets/js/my_wallet.js.coffee': ['coffee'],
      'assets/js/routes.js.coffee' : ['coffee'],
      'assets/js/app.js.coffee' : ['coffee'],
      'tests/**/*.coffee' : ['coffee']
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
    
    ngJade2JsPreprocessor: {
      stripPrefix: 'app/',
      prependPrefix: '',

      // or define a custom transform function
      // cacheIdFromPath: function(filepath) {
      //   console.log(filepath);
      //   return null;
      // },

      // Support for jade locals to render at compile time
      // locals: {
      //   foo: 'bar'
      // },

      templateExtension: 'html',

      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
      // moduleName: 'foo',

      // Jade compiler options. For a list of possible options, consult Jade documentation.
      jadeOptions: {
        doctype: 'xml'
      }
    },

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],

    plugins : [
      'karma-jade-preprocessor',
      'karma-coffee-preprocessor',
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-junit-reporter',
      'karma-osx-reporter',
      'karma-ng-jade2js-preprocessor',
      'karma-coverage'
    ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    },
    
    reporters: ['progress','osx', 'coverage'],

    coverageReporter: {
      type : 'html',
      dir : 'coverage/',
      subdir: '.'
    }

  });
};