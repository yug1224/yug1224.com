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
const rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
const stylus = require('gulp-stylus');
const source = require('vinyl-source-stream');

const db = mongojs('blog', ['archives']);
const ObjectId = mongojs.ObjectId;

gulp.task('clean', (done) => {
  del(['./dist/*'], done);
});

gulp.task('scripts', () => {
  gulp.src(['./src/scripts/*.coffee'])
  .pipe(
    foreach((stream, file) => {
      let filename = path.basename(file.path, '.coffee');
      return browserify({
        entries: file.path,
        extensions: ['.coffee'],
        debug: true
      })
      .bundle()
      .pipe(source(`${filename}.js`));
    })
  )
  .pipe(gulp.dest('./dist/js'));
});

gulp.task('styles', () => {
  let filter = Filter('**/*.styl', {restore: true});
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
  .pipe(gulp.dest('./dist/css'));
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
  .pipe(gulp.dest('./dist/fonts'));
});

// vendor
gulp.task('vendor', ['vendor:fonts']);

gulp.task('generate', (done) => {
  runSequence('clean', 'vendor', 'scripts', 'styles', done);
});

gulp.task('nodemon', () => {
  let options = {
    script: './src/app.coffee',
    env: {
      NODE_ENV: 'development'
    }
  };
  nodemon(options);
});

gulp.task('preview', ['watch'], (done) => {
  runSequence('generate', 'nodemon', done);
});

// Create new post
gulp.task('new', (done) => {
  let now = new Date();
  let _id = new ObjectId();
  let filepath = `./data/${_id}.md`;

  let frontMatter = `---
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
    if(err) {
      console.err(err);
    } else {
      console.log(`Creating arcive: ${filepath}`);
    }
    done();
  });
});

// Edit post
gulp.task('edit', (done) => {
  rl.question('Enter arcive\'s _id: ', (input) => {
    rl.close();

    db.archives.find({_id: new ObjectId(input)}, (err, docs) => {
      if(err) {
        console.err(err);
      } else {
        let doc = docs[0];
        let filepath = `./data/${doc._id}.md`;
        let frontMatter = `---
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
          if(err) {
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
});


// upsert
gulp.task('upsert', (done) => {
  let files = [];
  let promises = [];
  fs.readdirSync('./data').forEach(function(val){
    if (val.match(/\.md/)) {
      files.push(val);
    }
  });

  for (let val of files) {
    promises.push(new Promise(function(resolve, reject){
      let data = fm(fs.readFileSync(`./data/${val}`, 'utf8'));
      let attr = data.attributes;
      let doc = {
        title: attr.title,
        create: moment(attr.create, 'YYYY-MM-DD HH:mm').toDate(),
        modify: moment(attr.modify, 'YYYY-MM-DD HH:mm').toDate(),
        categories: attr.categories,
        image: attr.image,
        body: data.body
      };
      db.archives.findAndModify({
        query: {_id: new ObjectId(attr._id)},
        update: doc,
        upsert: true
      }, function (err, doc) {
        if(err) {
          reject(err);
        }
        else {
          resolve(doc);
        }
      });
    }));
  }
  Promise.all(promises)
    .then(function(results){
      console.log(results);
      done();
    })
    .catch(function(err){
      console.log(err);
      done();
    });
});

// pub
gulp.task('pub', () => {
  let options = {
    url: 'https://yug1224.superfeedr.com/',
    json: true,
    form: {
      'hub.mode': 'publish',
      'hub.url': 'https://blog.yug1224.com/atom.xml'
    }
  };

  request.post(options, (err, res) => {
    if(err) {
      process.stderr.write(err);
    } else {
      process.stdout.write(`${res.statusCode} ${res.statusMessage}\n`);
    }
    process.exit();
  });
});
