const browserify = require('browserify');
const concat = require('gulp-concat');
const del = require('del');
const Filter = require('gulp-filter');
const foreach = require('gulp-foreach');
const gulp = require('gulp');
const minifycss = require('gulp-minify-css');
const path = require('path');
const runSequence = require('run-sequence');
const stylus = require('gulp-stylus');
const source = require('vinyl-source-stream');

gulp.task('clean', (done) => {
  del(['./dst/*'], done);
});

gulp.task('scripts', () => {
  return gulp.src(['./src/scripts/*.js'])
    .pipe(
      foreach((stream, file) => {
        const filename = path.basename(file.path, '.js');

        return browserify({
          entries: file.path,
          extensions: ['.js'],
          debug: true
        })
        .transform('babelify', {presets: ['es2015']})
        .bundle()
        .pipe(source(`${filename}.js`));
      })
    )
    .pipe(gulp.dest('./dst/js'));
});

gulp.task('styles', () => {
  const filter = Filter('**/*.styl', {restore: true});
  gulp.src([
    './node_modules/bootstrap/dist/css/bootstrap.css',
    './node_modules/highlight.js/styles/zenburn.css',
    './src/styles/*.styl'
  ])
  .pipe(filter)
  .pipe(stylus())
  .pipe(filter.restore)
  .pipe(concat('app.css'))
  .pipe(minifycss({keepBreaks: true}))
  .pipe(gulp.dest('./dst/css'));
});

// vendor:fonts
gulp.task('vendor:fonts', () => {
  gulp.src(['./node_modules/bootstrap/dist/fonts/*'])
  .pipe(gulp.dest('./dst/fonts'));
});

// vendor
gulp.task('vendor', ['vendor:fonts']);

gulp.task('build', (done) => {
  runSequence('clean', 'vendor', 'scripts', 'styles', done);
});
