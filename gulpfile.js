'use strict';
const browserify = require('browserify');
const concat = require('gulp-concat');
const del = require('del');
const Filter = require('gulp-filter');
const fm = require('front-matter');
const foreach = require('gulp-foreach');
const fs = require('fs');
const gulp = require('gulp');
const runSequence = require('run-sequence');
const minifycss = require('gulp-minify-css');
const moment = require('moment');
const mongojs = require('mongojs');
const nodemon = require('nodemon');
const path = require('path');
const request = require('request');
const stylus = require('gulp-stylus');
const source = require('vinyl-source-stream');

const db = mongojs('blog', ['archives']);
const ObjectId = mongojs.ObjectId;

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
    './src/styles/*.styl',
    './node_modules/bootstrap/dist/css/bootstrap.css',
    './node_modules/highlight.js/styles/zenburn.css'
  ])
  .pipe(filter)
  .pipe(stylus())
  .pipe(filter.restore)
  .pipe(concat('app.css'))
  .pipe(minifycss({keepBreaks: true}))
  .pipe(gulp.dest('./dst/css'));
});

gulp.task('watch', () => {
  gulp.watch([
    './src/scripts/*.coffee',
    './src/lib/*.coffee'
  ], ['scripts']);
  gulp.watch([
    './src/styles/*.styl'
  ], ['styles']);
});

// vendor:fonts
gulp.task('vendor:fonts', () => {
  gulp.src(['./node_modules/bootstrap/dist/fonts/*'])
  .pipe(gulp.dest('./dst/fonts'));
});

// vendor
gulp.task('vendor', ['vendor:fonts']);

gulp.task('generate', (done) => {
  runSequence('clean', 'vendor', 'scripts', 'styles', done);
});

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

gulp.task('default', ['watch'], (done) => {
  runSequence('generate', 'nodemon', done);
});

// Create new post
gulp.task('new:post', (done) => {
  const now = new Date();
  const _id = new ObjectId();
  const filepath = `./data/${_id}.md`;

  const frontMatter = `---
_id: ${_id}
title:
create: ${moment(now).format('YYYY-MM-DD HH:mm')}
modify: ${moment(now).format('YYYY-MM-DD HH:mm')}
categories: []
image:
---



<!-- more -->
`;

  fs.writeFile(filepath, frontMatter, (err) => {
    if (err) {
      console.err(err);
    } else {
      console.log(`Creating arcive: ${filepath}`);
    }
    done();
    process.exit();
  });
});

// Edit post
gulp.task('edit:post', (done) => {
  const input = process.argv[4];
  console.log(input);
  db.archives.find({_id: new ObjectId(input)}, (err, docs) => {
    if (err) {
      console.err(err);
    } else {
      const doc = docs[0];
      const filepath = `./data/${doc._id}.md`;
      const frontMatter = `---
_id: ${doc._id}
title: ${doc.title}
create: ${moment(doc.create).format('YYYY-MM-DD HH:mm')}
modify: ${moment(new Date()).format('YYYY-MM-DD HH:mm')}
categories: [${doc.categories.join(', ')}]
image: ${doc.image ? doc.image : ''}
---
${doc.body}
`;

      fs.writeFile(filepath, frontMatter, (err) => {
        if (err) {
          console.err(err);
        } else {
          console.log(`Creating arcive: ${filepath}\n`);
        }
        done();
        process.exit();
      });
    }
  });
});


// upsert
gulp.task('upsert:post', (done) => {
  const files = [];
  const promises = [];
  fs.readdirSync('./data').forEach((val) => {
    if (val.match(/\.md/)) {
      files.push(val);
    }
  });

  const sort = (a, b) => {
    return a > b ? 1 : -1;
  };

  for (const val of files) {
    promises.push(new Promise((resolve, reject) => {
      const data = fm(fs.readFileSync(`./data/${val}`, 'utf8'));
      const attr = data.attributes;
      const doc = {
        title: attr.title,
        create: moment(attr.create, 'YYYY-MM-DD HH:mm').toDate(),
        modify: moment(attr.modify, 'YYYY-MM-DD HH:mm').toDate(),
        categories: attr.categories.sort(sort),
        image: attr.image,
        body: data.body
      };
      db.archives.findAndModify({
        query: {_id: new ObjectId(attr._id)},
        update: doc,
        upsert: true
      }, (err, doc) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(doc);
        }
      });
    }));
  }
  Promise.all(promises)
    .then((results) => {
      console.log(results);
      done();
      process.exit();
    })
    .catch((err) => {
      console.log(err.stack);
      done();
      process.exit();
    });
});

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
