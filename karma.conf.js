module.exports = function (config) {
  var configuration = {

    basePath: './',

    logLevel: config.LOG_WARN,

    client: { captureConsole: false },

    exclude: [],

    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'node_modules/jasmine-es6-promise-matchers/jasmine-es6-promise-matchers.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-sanitize/angular-sanitize.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/oclazyload/dist/ocLazyLoad.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-ui-select/dist/select.js',
      'bower_components/angular-audio/app/angular.audio.js',
      'bower_components/qrcode/lib/qrcode.min.js',
      'bower_components/angular-qr/angular-qr.min.js',
      'bower_components/angular-inview/angular-inview.js',
      'bower_components/browserdetection/src/browser-detection.js',
      'bower_components/compare-versions/index.js',
      'bower_components/ng-file-upload/ng-file-upload.min.js',
      'bower_components/angular-local-storage/dist/angular-local-storage.min.js',
      'assets/js/shared.module.js',
      'assets/js/sharedServices/*.service.js',
      'assets/js/sharedDirectives/*.directive.js',
      'tests/wallet-app.module.spec.js',
      'assets/js/landingCtrl.js',
      'assets/js/core/wallet-app.core.module.js',
      'build/js/templates.js',
      'assets/js/controllers/**/*.controller.js',
      'assets/js/components/**/*.component.js',
      'assets/js/wallet-filters.module.js',
      'assets/js/filters/*.js',
      'assets/js/services/**/*.service.js',
      'assets/js/directives/*.directive.js',
      'assets/js/constants/**/*.constant.js',
      'assets/js/wallet-lazy-load.module.js',
      'assets/js/core/*.js',
      'tests/filters/*.js',
      'tests/controllers/**/*.js',
      'tests/components/*.js',
      'tests/services/**/*.js',
      'tests/directives/*.js',
      'tests/mocks/**/*.js',
      'tests/**/*.js',
      'app/templates/*.pug'
    ],

    autoWatch: true,

    preprocessors: {
      '**/*.pug': ['ng-pug2js'],
      'assets/js/core/wallet-app.core.module.js': ['babel'],
      'assets/js/controllers/**/*.js': ['coverage', 'babel'],
      'assets/js/components/**/*.js': ['coverage', 'babel'],
      'assets/js/wallet-filters.module.js': ['babel', 'coverage'],
      'assets/js/filters/*.filter.js': ['babel', 'coverage'],
      'assets/js/services/*.service.js': ['babel', 'coverage'],
      'assets/js/directives/*.directive.js': ['babel', 'coverage'],
      'assets/js/shared.module.js': ['babel'],
      'assets/js/sharedServices/*.service.js': ['babel', 'coverage'],
      'assets/js/sharedDirectives/*.directive.js': ['babel', 'coverage'],
      'assets/js/core/*.service.js': ['babel'],
      'assets/js/routes.js': ['babel', 'coverage'],
      'assets/js/wallet-app.module.js': ['babel'],
      'assets/js/landingCtrl.js': ['babel', 'coverage'],
      'tests/**/*.js': ['babel']
    },
    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline'
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    },
    ngPug2JsPreprocessor: {
      stripPrefix: 'app/',
      prependPrefix: '',

      // or define a custom transform function
      // cacheIdFromPath: function(filepath) {
      //   console.log(filepath);
      //   return null;
      // },

      // Support for pug locals to render at compile time
      // locals: {
      //   foo: 'bar'
      // },

      templateExtension: 'html',

      // setting this option will create only a single module that contains templates
      // from all the files, so you can load them all with module('foo')
      // moduleName: 'foo',

      // Pug compiler options. For a list of possible options, consult Pug documentation.
      pugOptions: {
        doctype: 'xml'
      }
    },

    browserify: {
      debug: true,
      transform: [
        'babelify',
        ['browserify-istanbul', { instrumenter: require('isparta') }]
      ]
    },

    frameworks: ['jasmine', 'browserify'],

    browsers: ['PhantomJS'],

    reporters: ['progress', 'osx', 'coverage'],

    coverageReporter: {
      reporters: [
        {type: 'html', dir: 'coverage/'},
        {type: 'lcovonly', dir: 'coverage-lcov/'}
      ],

      subdir: '.'
    }
  };

  if (process.env.TRAVIS) {
    // Optionally do something Travis specific
  }

  config.set(configuration);
};
