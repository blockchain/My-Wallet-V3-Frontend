fs = require("fs")
path = require("path")
require 'shelljs/global'

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

      landingDependencies:
        src: "build/js/landing-not-minified-dependencies.js"
        dest: "build/js/landing-minified-dependencies.min.js"
        options: {
          mangle: false
        }

      wallet:
        src: "build/js/wallet.js"
        dest: "dist/js/wallet.min.js"
        options: {
          mangle: false
        }

      bcQrReader:
        src: "build/js/bc-qr-reader.js"
        dest: "dist/js/bc-qr-reader.min.js"
        options: {
          mangle: false
        }

      bcPhoneNumber:
        src: "build/js/bc-phone-number.js"
        dest: "dist/js/bc-phone-number.min.js"
        options: {
          mangle: false
        }

    preprocess:
      options: {
        context : {
          PRODUCTION: true
        }
      }

      html:
        expand: true
        src: ['build/index.html']
        dest: ''

      js:
        expand: true
        src: ['build/js/app.js']
        dest: ''

    concat:
      options:
        banner: "(function () {\n"
        separator: "})();\n(function () {\n"
        footer: "})();"

      landingNotMinifiedDependencies:
        src: [
          "bower_components/angular-translate/angular-translate.js"
          "bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js"
          'bower_components/angular-ui-router/release/angular-ui-router.js'
          "bower_components/browserdetection/src/browser-detection.js"
          "bower_components/oclazyload/dist/ocLazyLoad.js"
          'bower_components/angular-ui-select/dist/select.js'
          "build/js/sharedDirectives.js"
          "build/js/sharedDirectives/public-header.directive.js"
          "build/js/sharedDirectives/video-container.directive.js"
          "build/js/sharedDirectives/scroll-in-view.directive.js"
          "build/js/translations.js"
          "build/js/app.js"
          'build/js/landingCtrl.js'
          'build/js/routes.js'
          "build/js/services/bcTranslationLoader.service.js"
        ]
        dest: "build/js/landing-not-minified-dependencies.js"

      landing:
        src: [
          "bower_components/angular/angular.min.js",
          "bower_components/angular-sanitize/angular-sanitize.min.js",
          "bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js",
          "build/js/landing-minified-dependencies.min.js"
        ]
        dest: "dist/js/landing.min.js"


      wallet:
        src: [
          'node_modules/babel-polyfill/dist/polyfill.js'
          'build/js/core/core.module.js'
          'build/js/core/*.service.js'
          'build/js/services/*.js'
          'build/js/controllers/*.js'
          'build/js/controllers/settings/*.js'
          'build/js/directives/*.js'
          'build/js/filters.js'
          'bower_components/angular-audio/app/angular.audio.js'
          'bower_components/angular-inview/angular-inview.js'
          'bower_components/angular-cookies/angular-cookies.min.js'
          'bower_components/angular-animate/angular-animate.min.js'
          'build/js/templates.js'
          'bower_components/webcam-directive/app/scripts/webcam.js'
          'bower_components/angular-password-entropy/password-entropy.js'
          'bower_components/qrcode/lib/qrcode.js'
          'bower_components/angular-qr/src/angular-qr.js'
          'bower_components/compare-versions/index.js'
          'build/js/walletLazyLoad.js'
        ]

        dest: "build/js/wallet.js"

      qrReader:
        src: [
          'bower_components/bc-qr-reader/dist/bc-qr-reader.js'
        ]
        dest: "build/js/bc-qr-reader.js"

      bcPhoneNumber:
        src:
          [
            'bower_components/digits-trie/dist/digits-trie.js'
            'bower_components/google-libphonenumber/dist/browser/libphonenumber.js'
            'bower_components/bc-countries/dist/bc-countries.js'
            'bower_components/bc-phone-number/dist/js/bc-phone-number.js'
          ]
        dest: "build/js/bc-phone-number.js"

    sass:
      build:
        files: [{
          expand: true,
          cwd: 'assets/css',
          src: ['**/*.scss'],
          dest: 'build/css',
          ext: '.css'
        }]

    includeSource:
      options:
        templates:
          jade:
            js: 'script(src="{filePath}" type="text/javascript" defer="defer")'
            css: 'link(href="{filePath}" rel="stylesheet" type="text/css")'
      myTarget:
        files:
          'build/index.jade': 'app/index.jade'
          'build/landing.jade': 'app/landing.jade'

    concat_css: {
      app: {
        src: [
          "bower_components/angular-ui-select/dist/select.min.css"
          "bower_components/bc-css-flags/dist/css/bc-css-flags.css"
          "bower_components/bc-phone-number/dist/css/bc-phone-number.css"
          "build/css/ladda.css"
          "build/css/fonts.css"
          "build/css/angular-csp.css"
          "build/css/blockchain.css"
          "build/css/fonts.css"
        ],
        dest: "build/css/wallet.css"
      }
    },

    autoprefixer: {
      options: {
        browsers: ['last 2 versions'],
        # TEMP
        remove: false
        # END TEMP
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
        singleModule: true
      main:
        src: ["app/partials/notifications/*.jade", "app/partials/settings/*.jade", "app/partials/*.jade", "app/templates/*.jade"],
        dest: 'build/js/templates.js'
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
          {src: ["index.html", "landing.html"], dest: "dist/", cwd: "build", expand: true}
          {src: ["img/**/*"], dest: "dist/", cwd: "build", expand: true}
          {src: ["locales/*"], dest: "dist/", cwd: "build", expand: true}
          {src: ["**/*"], dest: "dist/fonts", cwd: "build/fonts", expand: true}
        ]

      legacy_cache_bust:
        files: [
          {src: ["wallet.min.js"], dest: "dist/", cwd: "assets/legacy-cache-bust", expand: true}
        ]

      css:
        files: [
          {src: ["ui-bootstrap-csp.css"], dest: "build/css", cwd: "bower_components/angular-bootstrap", expand: true }
        ]
      css_dist:
          {src: ["wallet.css"], dest: "dist/css", cwd: "build/css", expand: true }

      fonts:
        files: [
          {src: ["bootstrap/*"], dest: "build/fonts", cwd: "bower_components/bootstrap-sass/assets/fonts", expand: true}
          {src: ["*"], dest: "build/fonts", cwd: "assets/fonts/bc-icons", expand: true}
          {src: ["*"], dest: "build/fonts", cwd: "assets/fonts/roboto", expand: true}
          {src: ["*"], dest: "build/fonts", cwd: "assets/fonts/themify", expand: true}

        ]

      blockchainWallet:
        files: [
          {src: ["my-wallet.min.js"], dest: "dist/js", cwd: "bower_components/blockchain-wallet/dist", expand: true }
        ]

      images:
        files: [
          {src: ["**/*"], dest: "build/img", cwd: "img", expand: true }
          {src: ["*"], dest: "build/img", cwd: "bower_components/bc-css-flags/dist/img", expand: true}
        ]

    watch:
      jade:
        files: ['app/partials/**/*.jade', 'app/templates/**/*.jade']
        tasks: ['html2js']
        options:
          spawn: false

      css:
        files: ['assets/css/**/*.scss']
        tasks: ['sass', 'concat_css', 'copy:fonts']
        options:
          spawn: false

      es6:
        files: ['assets/js/controllers/**/*.js','assets/js/services/**/*.js','assets/js/sharedDirectives/**/*.js','assets/js/directives/**/*.js','assets/js/core/**/*.js','assets/js/*.js']
        tasks: ['babel:build', 'includeSource', 'concat:wallet']
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
          "build/index.html": "app/index.jade"
          "build/landing.html": "app/landing.jade"


    babel:
      options:
        sourceMap: true
        presets: ['es2015']
      build:
        files: [{
          expand: true,
          cwd: 'assets/js',
          src: ['**/*.controller.js','services/**/*.js','sharedDirectives/**/*.js','directives/**/*.js','core/**/*.js','*.js'],
          dest: 'build/js',
        }]

    rename:
      assets: # Renames all images, fonts, etc and updates [landing,wallet].min.js and wallet.css with their new names.
        options:
          skipIfHashed: true
          startSymbol: "{{"
          endSymbol: "}}"
          algorithm: "sha1"
          format: "{{basename}}-{{hash}}.{{ext}}"

          callback: (befores, afters) ->
            publicdir = fs.realpathSync("dist")

            # Start with the longest file names, so e.g. some-font.woff2 is renamed before some-font.woff.
            tuples = new Array
            i = 0
            while i < befores.length
              tuples.push [path.relative(publicdir, befores[i]),path.relative(publicdir, afters[i])]
              i++

            tuples.sort((a,b) -> b[0].length - a[0].length)

            ordered_befores = tuples.map((t)->t[0])
            ordered_afters  = tuples.map((t)->t[1])

            for referring_file_path in ["dist/js/landing.min.js", "dist/js/wallet.min.js", "dist/css/wallet.css", "dist/index.html", "dist/landing.html"]
              contents = grunt.file.read(referring_file_path)
              before = undefined
              after = undefined
              i = 0

              while i < ordered_befores.length
                before = ordered_befores[i]
                after  = ordered_afters[i]
                contents = contents.split("build/" + before).join(after)
                contents = contents.split(before).join(after)

                i++
              grunt.file.write referring_file_path, contents
            return

        files:
          src: [
            'dist/js/bc-qr-reader.min.js'
            'dist/js/bc-phone-number.min.js'
            'dist/img/*.*'
            'dist/img/favicon/*'
            'dist/fonts/*.*'
            'dist/fonts/bootstrap/*'
            'dist/locales/*'
            'dist/beep.wav'
          ]

      wallet: # Renames (my-)wallet.min.js/css and updates landing.min.js
        options:
          skipIfHashed: true
          startSymbol: "{{"
          endSymbol: "}}"
          algorithm: "sha1"
          format: "{{basename}}-{{hash}}.{{ext}}"

          callback: (befores, afters) ->
            publicdir = fs.realpathSync("dist")

            for referring_file_path in ["dist/js/landing.min.js"]
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
            'dist/js/my-wallet.min.js'
            'dist/js/wallet.min.js'
            'dist/landing.html'
          ]

      landing: # Renames landing.min.js/css and updates index.html
        options:
          skipIfHashed: true
          startSymbol: "{{"
          endSymbol: "}}"
          algorithm: "sha1"
          format: "{{basename}}-{{hash}}.{{ext}}"

          callback: (befores, afters) ->
            publicdir = fs.realpathSync("dist")

            for referring_file_path in ["dist/index.html"]
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
            'dist/js/landing.min.js'
            'dist/css/wallet.css'
          ]

    shell:
      check_translations:
        command: () ->
          'ruby check_translations.rb'

      tag_release:
        command: (newVersion, message) ->
          "git tag -a -s #{ newVersion } -m '#{ message }' && git push --tags"

    git_changelog:
      default:
        options:
          file: 'Changelog.md',
          app_name : 'Blockchain HD Frontend',
          # logo : 'https://raw.githubusercontent.com/blockchain/My-Wallet-HD-Frontend/changelog/assets/icons/png/logo.png',
          intro : 'Recent changes'
          grep_commits: '^fix|^feat|^docs|^style|^refactor|^chore|^test|BREAKING'
          repo_url: 'https://github.com/blockchain/My-Wallet-HD-Frontend'
          branch_name: 'master'

    coveralls:
      options:
        debug: true
        coverageDir: 'coverage-lcov'
        dryRun: false
        force: true
        recursive: true

    replace:
      root_url:
        src: ['build/js/app.js'],
        overwrite: true,
        replacements: [{
          from: 'customRootURL = $rootScope.rootURL'
          to: () =>
            if @rootDomain == null
              "customRootURL = '/'"
            else
              "customRootURL = 'https://" + @rootDomain + "/'"
        }]
      web_socket_url:
        src: ['build/js/wallet.js'],
        overwrite: true,
        replacements: [{
          from: 'customWebSocketURL = $rootScope.webSocketURL'
          to: () =>
            'customWebSocketURL = "wss://' + @rootDomain + '/inv"'
        }]
      api_domain:
        src: ['build/js/wallet.js'],
        overwrite: true,
        replacements: [{
          from: 'customApiDomain = $rootScope.apiDomain'
          to: () =>
            "customApiDomain = 'https://" + @apiDomain + "/'"
        }]
      version_frontend:
        src: ['build/js/app.js'],
        overwrite: true,
        replacements: [{
          from: 'versionFrontend = null'
          to: () =>
            "versionFrontend = '" + @versionFrontend + "'"
        }]

      version_my_wallet:
        src: ['build/js/services/wallet.service.js'],
        overwrite: true,
        replacements: [{
          from: 'versionMyWallet = null'
          to: () =>
            version = exec('./my_wallet_bower_version.rb').output
            "versionMyWallet = '" + version.replace("\n", "") + "'"
        }]

  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-sass')
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
  grunt.loadNpmTasks('grunt-karma-coveralls')
  grunt.loadNpmTasks('grunt-text-replace')
  grunt.loadNpmTasks('grunt-include-source')

  grunt.registerTask "build", [
    "html2js"
    "babel:build"
    "concat:wallet"
    "concat:qrReader"
    "concat:bcPhoneNumber"
    "sass"
    "concat_css:app"
    "copy:fonts"
    "autoprefixer"
    "includeSource"
    "copy:images"
    "merge-json"
  ]

  grunt.registerTask "default", [
    "build"
    "watch"
  ]

  # Make sure npm and bower dependencies are up to date
  # Run clean, test and build first
  grunt.registerTask "dist", (versionFrontend, rootDomain, apiDomain) =>
    if !versionFrontend
      versionFrontend = "intermediate"
    else if versionFrontend[0] != "v"
      console.log "Version is missing 'v'"
      exit(1)

    @versionFrontend = versionFrontend

    if !rootDomain
      # Production will work with rootURL = "https://blockchain.info/" and "/"
      # Tor will only work with   rootURL = "/"
      console.log("No root domain specified, assuming blockchain.info or tor");
      @rootDomain = null

      grunt.task.run [
        "replace:root_url"
        # Web socket URL will default to wss://blockchain.info/inv
        # Web sockets currently don't work on our Tor site
        # "replace:web_socket_url"
      ]
    else
      console.log("Root domain: " + rootDomain)
      @rootDomain = rootDomain

      grunt.task.run [
        "replace:root_url"
        "replace:web_socket_url"
      ]

    if apiDomain
      @apiDomain = apiDomain
      console.log("Custom API domain: " + @apiDomain)

      grunt.task.run [
        "replace:api_domain"
      ]

    grunt.task.run [
      "replace:version_frontend"
      "replace:version_my_wallet"
      "preprocess:js"
      "concat:landingNotMinifiedDependencies"
      "uglify:landingDependencies"
      "concat:landing"
      "uglify:wallet"
      "uglify:bcQrReader"
      "uglify:bcPhoneNumber"
      "jade"
      "preprocess:html"
      "copy:main"
      "copy:blockchainWallet"
      "copy:css_dist"
      "rename:assets"
      "rename:wallet"
      "rename:landing"
      "copy:legacy_cache_bust"
    ]

  # Run dist first
  grunt.registerTask "release", (versionFrontend) =>
    if versionFrontend == undefined || versionFrontend[0] != "v"
      console.log "Missing version or version is missing 'v'"
      exit(1)

    grunt.task.run [
      "git_changelog"
      "shell:tag_release:#{ versionFrontend }:#{ versionFrontend }"
      "release_done:#{ versionFrontend }"
    ]

  grunt.registerTask "release_done", (versionFrontend) =>
    console.log "Release done. Please copy Changelog.md over to Github release notes:"
    console.log "https://github.com/blockchain/My-Wallet-V3-Frontend/releases/edit/#{ versionFrontend }"

  grunt.registerTask "check_translations", [
    "shell:check_translations"
  ]

  return
