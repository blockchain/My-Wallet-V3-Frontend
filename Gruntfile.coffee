module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    clean: {
      build: ["build"]
      dist: ["dist"]
      test: ["coverage"]
      sass: [".sass-cache"]
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
          'build/js/browser-polyfill.js' # Babel polyfill
          'build/js/wrappers/*.js' # Wrappers around MyWallet, MyWalletStore, etc
          'build/js/app.js' # Needs to be included before controllers
          'build/js/services/*.js'
          'build/js/controllers/*.js'
          'build/js/controllers/settings/*.js'
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
          'build/bower_components/qrcode/lib/qrcode.js'
          'build/bower_components/angular-qr/src/angular-qr.js'
          'build/bower_components/angular-ui-select/dist/select.js'
          'build/bower_components/angular-local-storage/dist/angular-local-storage.js'
          'build/bower_components/angular-ui-router/release/angular-ui-router.js'
          'build/bower_components/angular-translate/angular-translate.js'
          'build/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js'
          'build/bower_components/intl-tel-input/build/js/intlTelInput.js'
          'build/bower_components/intl-tel-input/lib/libphonenumber/build/utils.js'
          'build/bower_components/international-phone-number/releases/international-phone-number.js'
          'build/bower_components/browserdetection/src/browser-detection.js'
        ]

        dest: "build/application-dependencies.js"

      application: # All components should first be minimized. Only trusted sources should be imported as minified..
        src: [
          'assets/js/my-wallet/dist/my-wallet.min.js'
          "build/bower_components/jquery/dist/jquery.js" # Duplicate; also included in my-wallet a.t.m. Minified version causes problems.
          'build/bower_components/angular/angular.min.js'
          'build/bower_components/angular-sanitize/angular-sanitize.min.js'
          'build/bower_components/angular-cookies/angular-cookies.min.js'
          'build/bower_components/angular-animate/angular-animate.min.js'
          'build/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js'
          'build/bower_components/numeral/min/numeral.min.js'
          'build/bower_components/angular-numeraljs/dist/angular-numeraljs.js'
          'build/application-dependencies.min.js'
        ]

        dest: "dist/application.min.js"

      beta:
        src: [
          "build/bower_components/jquery/dist/jquery.js"
          "build/bower_components/angular/angular.min.js"
          "build/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js"
          "build/bower_components/bootstrap/dist/js/bootstrap.min.js"
          "app/admin.js"
        ]
        dest: "dist/beta-admin.js"

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

    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      }
      no_dest_multiple: {
        src: 'build/css/*.css'
      }
    },

    html2js: {
      options:
        jade:
          doctype: "html"
        base: "app"
      main: {
        src: ["app/partials/notifications/*.jade", "app/partials/settings/*.jade", "app/partials/*.jade", "app/templates/*.jade"],
        dest: 'build/js/templates.js'
      }
    },
    "merge-json": # TODO: generate this list...
      bg: {src: [ "locales/bg-*.json" ], dest: "build/locales/bg.json"}
      da: {src: [ "locales/da-*.json" ], dest: "build/locales/da.json"}
      de: {src: [ "locales/de-*.json" ], dest: "build/locales/de.json"}
      el: {src: [ "locales/el-*.json" ], dest: "build/locales/el.json"}
      en: {src: [ "locales/en-*.json" ], dest: "build/locales/en.json"}
      es: {src: [ "locales/es-*.json" ], dest: "build/locales/es.json"}
      fr: {src: [ "locales/fr-*.json" ], dest: "build/locales/fr.json"}
      hi: {src: [ "locales/hi-*.json" ], dest: "build/locales/hi.json"}
      hu: {src: [ "locales/hu-*.json" ], dest: "build/locales/hu.json"}
      id: {src: [ "locales/id-*.json" ], dest: "build/locales/id.json"}
      it: {src: [ "locales/it-*.json" ], dest: "build/locales/it.json"}
      ja: {src: [ "locales/ja-*.json" ], dest: "build/locales/ja.json"}
      ko: {src: [ "locales/ko-*.json" ], dest: "build/locales/ko.json"}
      nl: {src: [ "locales/nl-*.json" ], dest: "build/locales/nl.json"}
      no: {src: [ "locales/no-*.json" ], dest: "build/locales/no.json"}
      pl: {src: [ "locales/pl-*.json" ], dest: "build/locales/pl.json"}
      pt: {src: [ "locales/pt-*.json" ], dest: "build/locales/pt.json"}
      ro: {src: [ "locales/ro-*.json" ], dest: "build/locales/ro.json"}
      ru: {src: [ "locales/ru-*.json" ], dest: "build/locales/ru.json"}
      sl: {src: [ "locales/sl-*.json" ], dest: "build/locales/sl.json"}
      sv: {src: [ "locales/sv-*.json" ], dest: "build/locales/sv.json"}
      th: {src: [ "locales/th-*.json" ], dest: "build/locales/th.json"}
      tr: {src: [ "locales/tr-*.json" ], dest: "build/locales/tr.json"}
      vi: {src: [ "locales/vi-*.json" ], dest: "build/locales/vi.json"}
      "zh-cn": {src: [ "locales/zh-cn-*.json" ], dest: "build/locales/zh-cn.json"}

    copy:
      main:
        files: [
          {src: ["beep.wav"], dest: "dist/"}
          {src: ["index.html", "index-beta.html"], dest: "dist/", cwd: "build", expand: true}
          {src: ["admin.html"], dest: "dist/", cwd: "build", expand: true}
          {src: ["img/*"], dest: "dist/", expand: true}
          {src: ["locales/*"], dest: "dist/", cwd: "build", expand: true}
          {src: ["**/*"], dest: "dist/fonts", cwd: "build/fonts", expand: true}
        ]

      js:
        files: [
          {src: ["browser-polyfill.js"], dest: "build/js/", cwd: "node_modules/grunt-babel/node_modules/babel-core", expand: true}
        ]


      css:
        files: [
          {src: ["intlTelInput.css"], dest: "build/css", cwd: "bower_components/intl-tel-input/build/css", expand: true }
          {src: ["font-awesome.min.css"], dest: "build/css", cwd: "bower_components/fontawesome/css", expand: true }
          {src: ["*.css"], dest: "build/css", cwd: "assets/css", expand: true }
        ]
      fonts:
        files: [
          {src: ["bootstrap/*"], dest: "build/fonts", cwd: "bower_components/bootstrap-sass/assets/fonts", expand: true}
          {src: ["*"], dest: "build/fonts", cwd: "assets/fonts/bc-icons", expand: true}
          {src: ["*"], dest: "build/fonts", cwd: "assets/fonts/roboto", expand: true}
          {src: ["*"], dest: "build/fonts", cwd: "assets/fonts/themify", expand: true}

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
        files: ['assets/css/**/*.scss']
        tasks: ['sass', 'copy:css', 'copy:fonts']
        options:
          spawn: false

      es6:
        files: ['assets/js/controllers/**/*.js','assets/js/services/**/*.js','assets/js/directives/**/*.js','assets/js/wrappers/**/*.js','assets/js/*.js']
        tasks: ['babel:build']
        options:
          spawn: false

      js:
        files: ['assets/js/**/*.js.coffee']
        tasks: ['compile']
        options:
          spawn: false

      locales:
        files: ['locales/*.json']
        tasks: ['merge-json']
        options:
          spawn: false

    jade:
      html:
        options:
          client: false
        files:
          "build/admin.html": "app/admin.jade"
          "build/index.html": "app/index.jade"

    babel:
      options:
        sourceMap: true
      build:
        files: [{
          expand: true,
          cwd: 'assets/js',
          src: ['controllers/**/*.js','services/**/*.js','directives/**/*.js','wrappers/**/*.js','*.js'],
          dest: 'build/js',
          ext: '.js'
        }]

    rename:
      assets: # Renames all images, fonts, etc and updates application.min.js, application.css and admin.html with their new names.
        options:
          skipIfHashed: true
          startSymbol: "{{"
          endSymbol: "}}"
          algorithm: "sha1"
          format: "{{basename}}-{{hash}}.{{ext}}"

          callback: (befores, afters) ->
            # Start with the longest file names, so e.g. some-font.woff2 is renamed before some-font.woff.
            tuples = new Array
            i = 0
            while i < befores.length
              tuples.push [befores[i],afters[i]]
              i++

            tuples.sort((a,b) ->
              if a[0].length != b[0].length
                return a[0].length < b[0].length
              return a < b
            )

            befores = tuples.map((t)->t[0])
            afters = tuples.map((t)->t[1])

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
                contents = contents.split("build/" + before).join(after)
                contents = contents.split(before).join(after)

                i++
              grunt.file.write referring_file_path, contents
            return

        files:
          src: [
            'dist/img/*'
            'dist/fonts/*.*'
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
      deploy_static_to_dev:
        command: () ->
          'rsync -rz --delete dist hd-dev@server:'

      deploy_server_to_dev:
        command: () ->
          'rsync -rz --delete server.coffee hd-dev@server:'

      deploy_beta_to_dev:
        command: () ->
          'rsync -rz --delete node_modules/hd-beta hd-dev@server:node_modules/'

      deploy_static_to_staging:
        command: () ->
          'rsync -rz --delete dist hd-staging@server:'

      deploy_server_to_staging:
        command: () ->
          'rsync -rz --delete server.coffee hd-staging@server:'

      deploy_beta_to_staging:
        command: () ->
          'rsync -rz --delete node_modules/hd-beta hd-staging@server:node_modules/'

      deploy_static_to_alpha:
        command: () ->
          'rsync -rz --delete dist hd-alpha@server:'

      deploy_server_to_alpha:
        command: () ->
          'rsync -rz --delete server.coffee hd-alpha@server:'

      deploy_beta_to_alpha:
        command: () ->
          'rsync -rz --delete node_modules/hd-beta hd-alpha@server:node_modules/'

      deploy_start_dev:
        command: () ->
          'ssh hd-dev@server "./start.sh"'

      deploy_start_staging:
        command: () ->
          'ssh hd-staging@server "./start.sh"'

      deploy_start_alpha:
        command: () ->
          'ssh hd-alpha@server "./start.sh"'

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
           'cp bower.json build/ && cd build && bower install'

    git_changelog:
      default:
        options:
          file: 'Changelog.md',
          app_name : 'Blockchain HD Frontend',
          # logo : 'https://raw.githubusercontent.com/blockchain/My-Wallet-HD-Frontend/changelog/assets/icons/png/logo.png',
          intro : 'Recent changes'
          grep_commits: '^fix|^feat|^docs|^refactor|^chore|BREAKING'
          tag: '1.2.0'
          repo_url: 'https://github.com/blockchain/My-Wallet-HD-Frontend'

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
  grunt.loadNpmTasks('grunt-preprocess')
  grunt.loadNpmTasks('grunt-autoprefixer')
  grunt.loadNpmTasks('grunt-merge-json')
  grunt.loadNpmTasks('git-changelog')
  grunt.loadNpmTasks('grunt-babel')

  grunt.registerTask "compile", ["coffee"]

  grunt.registerTask "build", [
    "html2js"
    "compile"
    "babel:build"
    "sass"
    "copy:js"
    "copy:css"
    "copy:fonts"
    "autoprefixer"
    "copy:images"
    "merge-json"
  ]

  grunt.registerTask "default", [
    "build"
    "watch"
  ]

  grunt.registerTask "dist_beta", [
    "concat:beta"
    "concat_css:beta"
  ]

  # Default task(s).
  grunt.registerTask "dist", [
    "clean"
    "build"
    "shell:check_dependencies"
    "shell:npm_install_dependencies"
    "shell:bower_install_dependencies"
    "concat:application_dependencies"
    "uglify:application_dependencies"
    "concat:application"
    "concat_css:app"
    "jade"
    "copy:beta_index"
    "preprocess"
    "copy:main"
    "copy:beta"
    "dist_beta" # We don't check beta dependencies against a whitelist
    "rename:assets"
    "rename:html"
    "git_changelog"
  ]

  grunt.registerTask "dist_unsafe", [
    "clean"
    "build"
    "shell:skip_check_dependencies"
    "concat:application_dependencies"
    "uglify:application_dependencies"
    "concat:application"
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

  grunt.registerTask "deploy_static_to_dev", [
    "dist"
    "shell:deploy_static_to_dev"
    "shell:deploy_start_dev"
  ]

  grunt.registerTask "deploy_server_to_dev", [
    "shell:deploy_server_to_dev"
    "shell:deploy_start_dev"
  ]

  grunt.registerTask "deploy_beta_to_dev", [
    "shell:deploy_beta_to_dev"
    "shell:deploy_start_dev"
  ]

  grunt.registerTask "deploy_to_dev", [
    "dist"
    "shell:deploy_static_to_dev"
    "shell:deploy_beta_to_dev"
    "shell:deploy_server_to_dev"
    "shell:deploy_start_dev"
  ]

  grunt.registerTask "deploy_static_to_staging", [
    "dist"
    "shell:deploy_static_to_staging"
    "shell:deploy_start_staging"
  ]

  grunt.registerTask "deploy_server_to_staging", [
    "shell:deploy_server_to_staging"
    "shell:deploy_start_staging"
  ]

  grunt.registerTask "deploy_beta_to_staging", [
    "shell:deploy_beta_to_staging"
    "shell:deploy_start_staging"
  ]

  grunt.registerTask "deploy_to_staging", [
    "dist"
    "shell:deploy_static_to_staging"
    "shell:deploy_beta_to_staging"
    "shell:deploy_server_to_staging"
    "shell:deploy_start_staging"
  ]

  grunt.registerTask "deploy_static_to_alpha", [
    "dist"
    "shell:deploy_static_to_alpha"
    "shell:deploy_start_alpha"
  ]

  grunt.registerTask "deploy_server_to_alpha", [
    "shell:deploy_server_to_alpha"
    "shell:deploy_start_alpha"
  ]

  grunt.registerTask "deploy_beta_to_alpha", [
    "shell:deploy_beta_to_alpha"
    "shell:deploy_start_alpha"
  ]

  grunt.registerTask "deploy_to_alpha", [
    "dist"
    "shell:deploy_static_to_alpha"
    "shell:deploy_beta_to_alpha"
    "shell:deploy_server_to_alpha"
    "shell:deploy_start_alpha"
  ]

  return
