module.exports = (grunt) ->
  
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    clean: {
      build: ["build"]
      dist: {
        src: ["dist/*.js"]
      }
      shrinkwrap: 
        src: ["npm-shrinkwrap.json"]
    }
    uglify:
      options:
        banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"yyyy-mm-dd\") %> */\n"
        mangle: false
        
      application_dependencies:
        src: "build/application-dependencies.js"
        dest: "build/application-dependencies.min.js"
        options: {
          mangle: false
        }

    concat:
      options:
        separator: ";"
        
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
          'assets/js/webcam.js'
          'build/bower_components/angular-audio/app/angular.audio.js'
          # 'app/bower_components/angular-bootstrap-slider/slider.js'
          'build/bower_components/angular-inview/angular-inview.js'
          'assets/js/templates.js'
          'build/bower_components/bc-qr-reader/dist/bc-qr-reader.js'
          'build/bower_components/angular-password-entropy/password-entropy.js'
          'build/bower_components/intl-tel-input/lib/libphonenumber/build/utils.js'
          'build/bower_components/qrcode/lib/qrcode.js'
          'build/bower_components/angular-qr/src/angular-qr.js'
          'build/bower_components/angular-ui-select/dist/select.js'
          'build/bower_components/angular-local-storage/dist/angular-local-storage.js'
          'build/bower_components/angular-ui-router/release/angular-ui-router.js'
          'build/bower_components/angular-translate/angular-translate.js'
          'build/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js'
          'build/bower_components/intl-tel-input/build/js/intlTelInput.js'
          'build/bower_components/international-phone-number/releases/international-phone-number.js'
          # 'app/bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.js'
        ]

        dest: "build/application-dependencies.js"
                
      application: # All components should first be minimized. Only trusted sources should be imported as minified..
        src: [
          'assets/js/my-wallet/dist/my-wallet.min.js'
          'build/bower_components/angular/angular.min.js'
          'build/bower_components/angular-sanitize/angular-sanitize.min.js'
          'build/bower_components/angular-cookies/angular-cookies.min.js'
          'build/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js'
          'build/bower_components/numeral/min/numeral.min.js'
          'build/bower_components/angular-numeraljs/dist/angular-numeraljs.js'
          'build/application-dependencies.min.js'
        ]
        
        dest: "dist/application.min.js"
        
      application_debug: 
        src: [
          'build/mywallet.js'
          'app/bower_components/angular/angular.js'
          'app/bower_components/angular-sanitize/angular-sanitize.js'
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
          # 'app/bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js'
          'app/bower_components/intl-tel-input/build/js/intlTelInput.min.js'
          'app/bower_components/international-phone-number/releases/international-phone-number.min.js'
          'build/application-dependencies.min.js'
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
            src: ['**/*.scss', '**/*.css'],
            dest: 'build/css',
            ext: '.css'
          }]
        }
      }
        
    concat_css: {
      all: {
        src: [
          "build/bower_components/bootstrap-css-only/css/bootstrap.css"
          "build/bower_components/angular-ui-select/dist/select.min.css"
          # "build/bower_components/seiyria-bootstrap-slider/css/bootstrap-slider.css"
          'build/bower_components/angular/angular-csp.css'
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
      }
    },

    copy: 
      main:
        files: [
          # {src: ["jquery.min.js"],     dest: "dist/", cwd: "app/bower_components/jquery/dist", expand: true }
          {src: ["locale-*.json", "beep.wav", "favicon.ico"], dest: "dist/", cwd: "app", expand: true}
          {src: ["index.html"], dest: "dist/"}
          {src: ["img/*"], dest: "dist/", cwd: "app", expand: true}
          {src: ["fonts/*"], dest: "dist/", cwd: "app/bower_components/bootstrap-css-only", expand: true}
        ]
      angular_css:
        files: [
          {src: ["angular-csp.css"], dest: "assets/css", cwd: "app/bower_components/angular", expand: true }
        ]
                
    watch: {
      scripts: {
        files: ['app/partials/**/*.jade', 'app/templates/**/*.jade'],
        tasks: ['html2js'],
        options: {
          spawn: false,
        },
      },
      css: {
        files: ['app/bower_components/angular/angular-csp.css']
        task:  ['copy:angular_css']
      }
    },
    
    rename:
      assets:
        options:
          skipIfHashed: true
          startSymbol: "{{"
          endSymbol: "}}"
          algorithm: "sha1"
          format: "{{basename}}-{{hash}}.{{ext}}"

          callback: (befores, afters) ->
            publicdir = require("fs").realpathSync("dist")
            path = require("path")
            index = grunt.file.read("dist/index.html")
            before = undefined
            after = undefined
            i = 0

            while i < befores.length
              before = path.relative(publicdir, befores[i])
              after = path.relative(publicdir, afters[i])
              index = index.replace(before, after)
              i++
            grunt.file.write "dist/index.html", index
            return
    
        files: 
          src: [
            'dist/application.min.js'
            # 'dist/jquery.min.js' # Included in my-wallet.min.js
            'dist/application.css'
          ]
        
    shell: 
      staging: 
        command: () -> 
           'scp -Cr dist/* server11:dist'
           
      check_dependencies: 
        command: () -> 
           'mkdir -p build && ruby assets/js/my-wallet/check-dependencies.rb'
        
      npm_install_dependencies:
        command: () ->
           'cd build && npm install'
           
      bower_install_dependencies:
        command: () ->
           'cd build && touch .bowerrc && bower install'

      
    shrinkwrap: {}
  
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
  grunt.loadNpmTasks('grunt-rename-assets')
  grunt.loadNpmTasks('grunt-shell')
  grunt.loadNpmTasks('grunt-shrinkwrap')
    
  grunt.registerTask "compile", ["coffee"]  
    
  grunt.registerTask "default", [
    "html2js"
    "copy:angular_css"
    "watch"
  ]
    
  # Default task(s).
  grunt.registerTask "dist", [
    "clean"
    "compile"
    "html2js"
    "shrinkwrap"
    "shell:check_dependencies"
    "clean:shrinkwrap"
    "shell:npm_install_dependencies"
    "shell:bower_install_dependencies"
    "concat:application_dependencies"
    "uglify:application_dependencies"
    "concat:application"
    "sass"
    "concat_css"
    "copy:main"
    "rename"
  ]
  
  grunt.registerTask "dist_debug", [
    "clean"
    "compile"
    "html2js"
    "concat:application_dependencies"
    "uglify:application_dependencies"
    "concat:mywallet"
    "concat:application_debug"
    "sass"
    "concat_css"
    "copy:main"
    "rename"
  ]
  
  grunt.registerTask "staging", [
    "dist"
    "shell:staging"
  ]
  
  return