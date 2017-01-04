fs = require("fs")
path = require("path")
require 'shelljs/global'

module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON("package.json")
    uglify:
      options:
        banner: "/*! <%= pkg.name %> <%= grunt.template.today(\"yyyy-mm-dd\") %> */\n"
        mangle: false

      plaidDependencies:
        src: [
          "build/js/*.js",
        ]
        dest: "build/js/plaidApp.min.js"
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
        src: ['build/plaid/plaid.html']
        dest: ''

    concat:
      options:
        banner: "(function () {\n"
        separator: "})();\n(function () {\n"
        footer: "})();"

      plaidNotMinifiedDependencies:
        src: [
          'bower_components/angular-ui-router/release/angular-ui-router.js'
          'build/js/plaidApp.js'
        ]
        dest: "build/js/plaid-not-minified-dependencies.js"

      plaid:
        src: [
          "bower_components/angular/angular.min.js",
          "bower_components/angular-sanitize/angular-sanitize.min.js",
          "build/js/landing-minified-dependencies.min.js"
        ]
        dest: "dist/js/plaid.min.js"

    sass:
      build:
        files: [{
          expand: true,
          src: ['plaid/*.scss'],
          dest: 'build',
          ext: '.css'
        }]

    copy:
      main:
        files: [
          {src: ["**/*.html"], dest: "dist/", cwd: "build", expand: true}
        ]

      build:
        files: [
          {src: ["plaid/*.html"], dest: "build/", expand: true}
        ]

      css_dist:
          {src: ["plaid/app.css"], dest: "dist/css/plaid.css", cwd: "build/css", expand: true }

    watch:
      html:
        files: ['plaid/*.html']
        tasks: ['copy:build']
        options:
          spawn: false

      css:
        files: ['plaid/*.scss']
        tasks: ['sass']
        options:
          spawn: false

      es6:
        files: ['plaid/*.js']
        tasks: ['babel:build']
        options:
          spawn: false

    babel:
      options:
        sourceMap: true
        presets: ['es2015']
      build:
        files: [{
          expand: true,
          src: ['plaid/plaid.js'],
          dest: 'build',
        }]

    rename:
      landing: # Renames plaid.min.js/css and updates index.html
        options:
          skipIfHashed: true
          startSymbol: "{{"
          endSymbol: "}}"
          algorithm: "sha1"
          format: "{{basename}}-{{hash}}.{{ext}}"

          callback: (befores, afters) ->
            publicdir = fs.realpathSync("dist")

            for referring_file_path in ["dist/plaid/index.html"]
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
            'dist/plaid/js/plaid.min.js'
            'dist/plaid/css/plaid.css'
          ]

  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks('grunt-contrib-concat')
  grunt.loadNpmTasks('grunt-contrib-copy')
  grunt.loadNpmTasks('grunt-contrib-clean')
  grunt.loadNpmTasks('grunt-sass')
  grunt.loadNpmTasks('grunt-contrib-watch')
  grunt.loadNpmTasks('grunt-rename-assets')
  grunt.loadNpmTasks('grunt-preprocess')
  grunt.loadNpmTasks('grunt-babel')
  grunt.loadNpmTasks('grunt-text-replace')

  grunt.registerTask "build", [
    "babel:build"
    "copy:build"
    "sass"
  ]

  grunt.registerTask "default", [
    "build"
    "watch"
  ]

  grunt.registerTask "dist", () =>
    grunt.task.run [
      "preprocess:js"
      "concat:plaidNotMinifiedDependencies"
      "uglify:plaidDependencies"
      "concat:plaid"
      "uglify:plaid"
      "preprocess:html"
      "copy:main"
      "copy:css_dist"
      "rename:plaid"
    ]
