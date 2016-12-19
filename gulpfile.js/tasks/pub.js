const gulp = require('gulp');
const request = require('request');

// pub
gulp.task('pub', () => {
  const options = {
    url: 'https://yug1224.superfeedr.com/',
    json: true,
    form: {
      'hub.mode': 'publish',
      'hub.url': 'https://blog.yug1224.com/atom.xml'
    }
  };

  request.post(options, (err, res) => {
    if (err) {
      process.stderr.write(err);
    } else {
      process.stdout.write(`${res.statusCode} ${res.statusMessage}\n`);
    }
    process.exit();
  });
});
