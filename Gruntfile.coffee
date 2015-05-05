module.exports = (grunt) ->
  
  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    clean: {
      build: {
        src: ["build/**/*"]
      }
      dist: {
        src: ["dist/**/*"]
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
        
    preprocess:
      html:
        options: {
          context : {
            PRODUCTION: true
            BETA: false
          }
        },
        expand: true
        src: ['build/index.html']
        dest: ''
      beta:
        options: {
          context : {
            PRODUCTION: true
            BETA: true
          }
        },
        expand: true
        src: ['build/admin.html', 'build/index-beta.html']
        dest: ''
        
    concat:
      options:
        separator: ";"
        
      application_dependencies:
        src: [
          'build/js/wrappers/*.js' # Wrappers around MyWallet, MyWalletStore, etc
          'build/js/services/*.js'
          'build/js/controllers/*.js'
          'build/js/controllers/settings/*.js'
          'build/js/app.js' 
          'build/js/directives/*.js'
          'build/js/filters.js'
          'build/js/routes.js'
          'build/js/translations.js'
          'build/bower_components/angular-audio/app/angular.audio.js'
          'build/bower_components/angular-inview/angular-inview.js'
          'build/js/templates.js'
          'build/bower_components/webcam-directive/app/scripts/webcam.js'
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
          'build/bower_components/browserdetection/src/browser-detection.js'
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
        
      beta:
        src: [
          "build/bower_components/jquery/dist/jquery.js"
          "app/betaAdminClient.js"
        ]
        dest: "dist/beta-admin.js"
        
      application_debug: 
        src: [
          'build/mywallet.js'
          'bower_components/angular/angular.js'
          'bower_components/angular-sanitize/angular-sanitize.js'
          'bower_components/angular-cookies/angular-cookies.min.js'
          'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js'
          'bower_components/angular-ui-router/release/angular-ui-router.min.js'
          'bower_components/angular-ui-select/dist/select.min.js'
          'bower_components/qrcode/lib/qrcode.min.js'
          'bower_components/angular-qr/angular-qr.min.js'
          'bower_components/angular-local-storage/dist/angular-local-storage.min.js'
          'bower_components/numeral/min/numeral.min.js'
          'bower_components/angular-numeraljs/dist/angular-numeraljs.min.js'
          'bower_components/angular-translate/angular-translate.min.js'
          'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js'
          # 'bower_components/seiyria-bootstrap-slider/dist/bootstrap-slider.min.js'
          'bower_components/intl-tel-input/build/js/intlTelInput.min.js'
          'bower_components/international-phone-number/releases/international-phone-number.min.js'
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
        src: ["*.js.coffee", "wrappers/**/*.js.coffee", "controllers/**/*.js.coffee", "directives/**/*.js.coffee", "services/**/*.js.coffee"]
        dest: 'build/js'
        ext: ".js"
        
    sass: 
      build: 
        files: [{
          expand: true,
          cwd: 'assets/css',
          src: ['**/*.scss'],
          dest: 'build/css',
          ext: '.css'
        }]
      options:
        loadPath: ["bower_components/bootstrap-sass/assets/stylesheets"] 

    concat_css: {
      app: {
        src: [
          "build/bower_components/angular-ui-select/dist/select.min.css"
          # "build/bower_components/seiyria-bootstrap-slider/css/bootstrap-slider.css"
          "build/bower_components/angular/angular-csp.css"
          "build/css/blockchain.css" # Needs to be loaded first
          "build/css/**/*.css"
        ],
        dest: "dist/application.css"
      },
      beta: {
        src: [
          "build/css/blockchain.css"
          "build/css/navigation.css"
        ],
        dest: "dist/beta-admin.css"
      },
    },
    
    html2js: {
      options: 
        jade: 
          doctype: "html"
        base: "app"
      main: {
        src: ["app/partials/settings/*.jade", "app/partials/*.jade", "app/templates/*.jade"],
        dest: 'build/js/templates.js'
      }
    },

    copy:
      main:
        files: [
          {src: ["beep.wav"], dest: "dist/"}
          {src: ["index.html", "index-beta.html"], dest: "dist/", cwd: "build", expand: true}
          {src: ["admin.html"], dest: "dist/", cwd: "build", expand: true}
          {src: ["img/*"], dest: "dist/", expand: true}
          {src: ["locales/*"], dest: "dist/", expand: true}
          {src: ["bootstrap/*"], dest: "dist/fonts", cwd: "bower_components/bootstrap-sass/assets/fonts", expand: true}
        ]
        
      css:
        files: [
          {src: ["angular-csp.css"], dest: "build/css", cwd: "bower_components/angular", expand: true }
          {src: ["intlTelInput.css"], dest: "build/css", cwd: "bower_components/intl-tel-input/build/css", expand: true }
          {src: ["*.css"], dest: "build/css", cwd: "assets/css", expand: true }
          {src: ["bootstrap/*"], dest: "build/fonts", cwd: "bower_components/bootstrap-sass/assets/fonts", expand: true}
        ]
        
      beta:
        files: [
          {src: ["beta/betaAdminServer.js"], dest: "dist/", cwd: "app", expand: true}
          {src: ["beta/package.json"], dest: "dist/", cwd: "app", expand: true}
        ]
      
      beta_index:
        src: "build/index.html"
        dest: "build/index-beta.html"
        
      images:
        files: [
          {src: ["*"], dest: "build/img", cwd: "img", expand: true }
        ]
                
    watch: 
      jade:
        files: ['app/partials/**/*.jade', 'app/templates/**/*.jade']
        tasks: ['html2js']
        options: 
          spawn: false

      css: 
        files: ['assets/css/*.scss']
        tasks: ['sass', 'copy:css']
        options: 
          spawn: false

      js: 
        files: ['assets/js/**/*.js.coffee']
        tasks: ['compile']
        options: 
          spawn: false        

    jade: 
      html:
        options:
          client: false
        files:
          "build/admin.html": "app/admin.jade"
          "build/index.html": "app/index.jade"
          
    
    rename:
      assets: # Renames all images, fonts, etc and updates application.min.js, application.css and admin.html with their new names.
        options:
          skipIfHashed: true
          startSymbol: "{{"
          endSymbol: "}}"
          algorithm: "sha1"
          format: "{{basename}}-{{hash}}.{{ext}}"

          callback: (befores, afters) ->
            publicdir = require("fs").realpathSync("dist")
            path = require("path")
            for referring_file_path in ["dist/application.min.js", "dist/beta-admin.js", "dist/application.css", "dist/beta-admin.css", "dist/admin.html", "dist/index.html", "dist/index-beta.html"]
              contents = grunt.file.read(referring_file_path)
              before = undefined
              after = undefined
              i = 0

              while i < befores.length
                before = path.relative(publicdir, befores[i])
                after = path.relative(publicdir, afters[i])
                contents = contents.split(before).join(after)
                i++
              grunt.file.write referring_file_path, contents
            return
    
        files: 
          src: [
            'dist/img/*'
            'dist/fonts/bootstrap/*'
            'dist/locales/*'
            'dist/beep.wav'
          ]
    
      html: # Renames application/beta.min.js/css and updates index/admin.html
        options:
          skipIfHashed: true
          startSymbol: "{{"
          endSymbol: "}}"
          algorithm: "sha1"
          format: "{{basename}}-{{hash}}.{{ext}}"

          callback: (befores, afters) ->
            publicdir = require("fs").realpathSync("dist")
            path = require("path")
            
            for referring_file_path in ["dist/index.html", "dist/index-beta.html", "dist/admin.html"]
              contents = grunt.file.read(referring_file_path)
              before = undefined
              after = undefined
              i = 0

              while i < befores.length
                before = path.relative(publicdir, befores[i])
                after = path.relative(publicdir, afters[i])
                contents = contents.split(before).join(after)

                i++
              grunt.file.write referring_file_path, contents
  
        files: 
          src: [
            'dist/application.min.js'
            'dist/application.css'
            'dist/beta-admin.js'
            'dist/beta-admin.css'
          ]
        
    shell: 
      staging: 
        command: () -> 
           'rsync -r dist/ server12:dist'
           
      staging_experimental:
        command: () ->
           'scp -Cr dist/* server12:dist-experimental'
           
      check_dependencies: 
        command: () -> 
           'mkdir -p build && ruby assets/js/my-wallet/check-dependencies.rb'
           
      skip_check_dependencies:
        command: () ->
          'cp -r node_modules build && cp -r bower_components build'
        
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
  grunt.loadNpmTasks('grunt-contrib-jade')
  grunt.loadNpmTasks('grunt-concat-css')
  grunt.loadNpmTasks('grunt-html2js')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-rename-assets')
  grunt.loadNpmTasks('grunt-shell')
  grunt.loadNpmTasks('grunt-shrinkwrap')
  grunt.loadNpmTasks('grunt-preprocess')
  
    
  grunt.registerTask "compile", ["coffee"]  
    
  grunt.registerTask "default", [
    "html2js"
    "compile"
    "sass"
    "copy:css"
    "copy:images"
    "watch"
  ]
  
  grunt.registerTask "dist_beta", [
    "concat:beta"
    "concat_css:beta"    
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
    "copy:css" # CSS files not processed with sass
    "concat_css:app"
    "jade"
    "copy:beta_index"
    "preprocess"
    "copy:main"
    "copy:beta"
    "dist_beta" # We don't check beta dependencies against a whitelist 
    "rename:assets"
    "rename:html"
  ]
  
  grunt.registerTask "dist_unsafe", [
    "clean"
    "compile"
    "html2js"
    "shell:skip_check_dependencies"
    "concat:application_dependencies"
    "uglify:application_dependencies"
    "concat:application"
    "sass"
    "copy:css" # CSS files not processed with sass
    "concat_css:app"
    "jade"
    "copy:beta_index"
    "preprocess"
    "copy:main"
    "copy:beta"
    "dist_beta"
    "rename:assets"
    "rename:html"
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
    "copy:css" # CSS files not processed with sass
    "concat_css:app"
    "jade"
    "copy:beta_index"
    "preprocess"
    "copy:main"
    "copy:beta"
    "dist_beta"
    "rename:assets"
    "rename:html"
  ]
  
  grunt.registerTask "staging", [
    "dist"
    "shell:staging"
  ]
  
  grunt.registerTask "staging_experimental", [
    "dist_unsafe"
    "shell:staging_experimental"
  ]
  
  return