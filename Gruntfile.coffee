module.exports = (grunt) ->
  
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    clean: {
      build: ["build"]
      dist: {
        src: ["dist/*.js"]
      }
    }
    uglify:
      options:
        banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"yyyy-mm-dd\") %> */\n"

      bitcoinjs: 
        src: "assets/js/my-wallet/bitcoinjs.js"
        dest: "dist/bitcoinjs.min.js"
        
      mywallet:
        src:  "build/mywallet.js"
        dest: "build/mywallet.min.js"
        
      jsqrcode:
        src: "build/jsqrcode.js"
        dest: "build/jsqrcode.min.js"
        
      application_dependencies:
        src: "build/application-dependencies.js"
        dest: "build/application-dependencies.min.js"
        options: {
          mangle: false
        }

    concat:
      options:
        separator: ";"
        
      mywallet:
        src: [
          "assets/js/my-wallet/shared.js"
          'assets/js/my-wallet/bower_components/cryptojslib/rollups/sha256.js'
          'assets/js/my-wallet/bower_components/cryptojslib/rollups/aes.js'
          'assets/js/my-wallet/bower_components/cryptojslib/rollups/pbkdf2.js'
          'assets/js/my-wallet/bower_components/cryptojslib/components/cipher-core.js'
          'assets/js/my-wallet/bower_components/cryptojslib/components/pad-iso10126.js'
          'assets/js/my-wallet/bower_components/cryptojslib/components/mode-ecb.js'
          'assets/js/my-wallet/bower_components/cryptojslib/components/pad-nopadding.js'
          'assets/js/my-wallet/node_modules/sjcl/sjcl.js'
          'assets/js/my-wallet/crypto-util-legacy.js'
          'assets/js/my-wallet/blockchainapi.js'
          'assets/js/my-wallet/signer.js'
          'assets/js/my-wallet/wallet.js'
          'assets/js/my-wallet/wallet-signup.js'
          'assets/js/my-wallet/HDWalletAccount.js'
          'assets/js/my-wallet/hdwallet.js'
          'assets/js/my-wallet/mnemonic.js'
          'assets/js/my-wallet/bip39.js'
          'assets/js/my-wallet/xregexp-all.js'
          'assets/js/my-wallet/import-export.js'
          'assets/js/my_wallet.js'
        ]
        dest: "build/mywallet.js"
        
      jsqrcode:
        src: [
          'assets/js/jsqrcode/src/grid'
          'assets/js/jsqrcode/src/version'
          'assets/js/jsqrcode/src/detector'
          'assets/js/jsqrcode/src/formatinf'
          'assets/js/jsqrcode/src/errorlevel'
          'assets/js/jsqrcode/src/bitmat'
          'assets/js/jsqrcode/src/datablock'
          'assets/js/jsqrcode/src/bmparser'
          'assets/js/jsqrcode/src/datamask'
          'assets/js/jsqrcode/src/rsdecoder'
          'assets/js/jsqrcode/src/gf256poly'
          'assets/js/jsqrcode/src/gf256'
          'assets/js/jsqrcode/src/decoder'
          'assets/js/jsqrcode/src/qrcode'
          'assets/js/jsqrcode/src/findpat'
          'assets/js/jsqrcode/src/alignpat'
          'assets/js/jsqrcode/src/databr'
        ]
        dest: "build/jsqrcode.js" 
        
      application_dependencies:
        src: [
          'build/my_wallet.js' # This is just a wrapper around MyWallet
          'build/services/*.js'
          'build/controllers/*.js'
          'build/controllers/settings/*.js'
          'build/app.js' 
          'build/directives/*.js'
          'build/filters.js'
          'build/routes.js'
          'build/translations.js'
          'assets/js/country-data.js'
          'assets/js/webcam.js'
          'app/bower_components/angular-audio/app/angular.audio.js'
          'app/bower_components/angular-bootstrap-slider/slider.js'
          'assets/js/templates.js'
        ]

        dest: "build/application-dependencies.js"
                
      application: # All components should first be minimized:
        src: [
          'build/mywallet.min.js'
          'app/bower_components/angular/angular.min.js'
          'app/bower_components/angular-sanitize/angular-sanitize.min.js'
          'app/bower_components/angular-cookies/angular-cookies.min.js'
          'app/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js'
          'app/bower_components/angular-ui-router/release/angular-ui-router.min.js'
          'app/bower_components/angular-ui-select/dist/select.min.js'
          'app/bower_components/qrcode/lib/qrcode.min.js'
          'app/bower_components/angular-qr/angular-qr.min.js'
          'app/bower_components/angular-local-storage/dist/angular-local-storage.min.js'
          'app/bower_components/numeral/min/numeral.min.js'
          'app/bower_components/angular-numeraljs/dist/angular-numeraljs.min.js'
          'app/bower_components/angular-translate/angular-translate.min.js'
          'app/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js'
          'app/bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js'
          'build/application-dependencies.min.js'
          'build/jsqrcode.min.js'
        ]
        
        dest: "dist/application.min.js"
        
    coffee:
      coffee_to_js:
        options:
          bare: true
          sourceMap: false
        expand: true
        flatten: false
        cwd: "assets/js"
        src: ["*.js.coffee", "controllers/**/*.js.coffee", "directives/**/*.js.coffee", "services/**/*.js.coffee"]
        dest: 'build'
        ext: ".js"
        
    sass: {
        dist: {
          files: [{
            expand: true,
            cwd: 'assets/css',
            src: ['**/*.scss'],
            dest: 'build/css',
            ext: '.css'
          }]
        }
      }
        
    concat_css: {
      all: {
        src: [
          "app/bower_components/bootstrap/dist/css/bootstrap.css"
          "app/bower_components/angular-ui-select/dist/select.min.css"
          "app/bower_components/seiyria-bootstrap-slider/css/bootstrap-slider.css"
          "build/css/**/*.css"
        ],
        dest: "dist/application.css"
      },
    },
    
    html2js: {
      options: 
        jade: 
          doctype: "html"
        base: "app"
      main: {
        src: ["app/partials/settings/*.jade", "app/partials/*.jade", "app/templates/*.jade"],
        dest: 'assets/js/templates.js'
      },
    },

    copy: 
      main:
        files: [
          {src: ["jquery.min.js"],     dest: "dist/", cwd: "app/bower_components/jquery/dist", expand: true }
          {src: ["locale-*.json"], dest: "dist/", cwd: "app", expand: true}
          {src: ["img/*"], dest: "dist/", cwd: "app", expand: true}
          
        ]
        
    watch: {
      scripts: {
        files: ['app/partials/**/*.jade', 'app/templates/**/*.jade'],
        tasks: ['html2js'],
        options: {
          spawn: false,
        },
      },
    },
  
  # Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-contrib-sass')
  grunt.loadNpmTasks('grunt-concat-css')
  grunt.loadNpmTasks('grunt-html2js')
  grunt.loadNpmTasks('grunt-contrib-watch')
    
  grunt.registerTask "compile", ["coffee"]  
    
  grunt.registerTask "default", [
    "watch"
  ]
    
  # Default task(s).
  grunt.registerTask "dist", [
    "clean"
    "compile"
    "uglify:bitcoinjs"
    "html2js"
    "concat:application_dependencies"
    "uglify:application_dependencies"
    "concat:mywallet"
    "uglify:mywallet"
    "concat:jsqrcode"
    "uglify:jsqrcode"
    "concat:application"
    "sass"
    "concat_css"
    "copy"
  ]
  return