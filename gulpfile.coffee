browserify = require "browserify"
coffee = require "gulp-coffee"
concat = require "gulp-concat"
del = require "del"
Filter = require "gulp-filter"
foreach = require "gulp-foreach"
gulp = require "gulp"
runSequence = require "run-sequence"
minifycss = require "gulp-minify-css"
nodemon = require "nodemon"
path = require "path"
stylus = require "gulp-stylus"
source = require "vinyl-source-stream"

gulp.task "clean", (done) ->
  del ["./dist/*"], done

gulp.task "scripts", () ->
  gulp.src ["./src/scripts/*.coffee"]
    .pipe foreach (stream, file) ->
      filename = path.basename file.path, ".coffee"
      return browserify
        entries: file.path
        extensions: [".coffee"]
        debug: true
      .bundle()
      .pipe source "#{filename}.js"
    .pipe gulp.dest "./dist/js"

gulp.task "styles", () ->
  filter = Filter "**/*.styl", restore: true
  gulp.src [
    "./src/styles/*.styl"
    "./node_modules/bootstrap/dist/css/bootstrap.css"
    "./node_modules/highlight.js/styles/zenburn.css"
  ]
  .pipe filter
  .pipe stylus()
  .pipe filter.restore
  .pipe concat "app.css"
  .pipe minifycss
    keepBreaks: true
  .pipe gulp.dest "./dist/css"

gulp.task "watch", () ->
  gulp.watch [
    "./src/scripts/*.coffee"
    "./src/lib/*.coffee"
  ], ["scripts"]
  gulp.watch [
    "./src/styles/*.styl"
  ], ["styles"]

# vendor:fonts
gulp.task "vendor:fonts", () ->
  gulp.src [
    "./node_modules/bootstrap/dist/fonts/*"
  ]
  .pipe gulp.dest "./dist/fonts"

# vendor
gulp.task "vendor", ["vendor:fonts"]

gulp.task "generate", (done) ->
  runSequence "clean",
    "vendor"
    "scripts"
    "styles"
    done

gulp.task "nodemon", () ->
  nodemon
    script: "./src/app.coffee"
    env:
      NODE_ENV: "development"

gulp.task "preview", ["watch"], (done) ->
  runSequence "generate", "nodemon", done

# pub
gulp.task "pub", ->
  options =
    url: "https://yug1224.superfeedr.com/"
    json: true
    form:
      "hub.mode": "publish"
      "hub.url": "https://blog.yug1224.com/atom.xml"

  request.post options, (err, res, body) ->
    if err
      console.log err
    process.exit()
    return
