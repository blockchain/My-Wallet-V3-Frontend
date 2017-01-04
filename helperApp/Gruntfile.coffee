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

      plaid:
        files: {
          "dist/plaid/plaid.min.js" : ["build/plaid/plaid.js", "build/**/*.js"]
        }

    preprocess:
      options: {
        context : {
          PRODUCTION: true
        }
      }

      html:
        expand: true
        src: ['dist/plaid/index.html']
        dest: ''

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
          {src: ["**/*.css"], dest: "dist/", cwd: "build", expand: true}
        ]

      build:
        files: [
          {src: ["plaid/*.html"], dest: "build/", expand: true}
        ]

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
          src: ['plaid/**/*.js'],
          dest: 'build',
        }]

    rename:
      plaid: # Renames plaid.min.js/css and updates index.html
        options:
          skipIfHashed: true
          startSymbol: "{{"
          endSymbol: "}}"
          algorithm: "sha1"
          format: "{{basename}}-{{hash}}.{{ext}}"

          callback: (befores, afters) ->
            publicdir = fs.realpathSync("dist")

            for referring_file_path in ["plaid/index.html"]
              contents = grunt.file.read("dist/" + referring_file_path)
              before = undefined
              after = undefined
              i = 0

              while i < befores.length
                dir = publicdir + '/' + referring_file_path.split('/')[0]
                before = path.relative(dir, befores[i])
                after = path.relative(dir, afters[i])
                contents = contents.split(before).join(after)

                i++
              grunt.file.write "dist/" + referring_file_path, contents

        files:
          src: [
            'dist/plaid/plaid.min.js'
            'dist/plaid/plaid.css'
          ]

  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.loadNpmTasks('grunt-contrib-copy')
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

  grunt.registerTask "dist", [
    "build"
    "uglify:plaid"
    "copy:main"
    "preprocess"
    "rename:plaid"
  ]
