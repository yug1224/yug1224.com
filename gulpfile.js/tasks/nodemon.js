const gulp = require('gulp');
const nodemon = require('nodemon');

// Devサーバ起動
gulp.task('nodemon', () => {
  const options = {
    script: './src/app.js',
    env: {
      NODE_ENV: 'development'
    },
    nodeArgs: ['--use-strict']
  };
  nodemon(options);
});
