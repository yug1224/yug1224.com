const gulp = require('gulp');
const requireDir = require('require-dir');
const runSequence = require('run-sequence');
requireDir('./tasks', {recurse: true});

gulp.task('watch', () => {
  gulp.watch(['./src/**/*.js'], ['scripts']);
  gulp.watch(['./src/**/*.styl'], ['styles']);
});

gulp.task('default', ['watch'], (done) => {
  runSequence('build', 'nodemon', done);
});
