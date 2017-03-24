const Promise = require('bluebird');
const fm = require('front-matter');
const fs = require('fs');
const gulp = require('gulp');
const yaml = require('js-yaml');
const moment = require('moment');
const mongojs = require('mongojs');

const db = mongojs('blog', ['archives']);
const ObjectId = mongojs.ObjectId;


// Create new post
gulp.task('posts:new', (done) => {
  const now = new Date();
  const _id = new ObjectId();
  const filepath = `./data/${_id}.md`;
  const frontMatter = yaml.safeDump({
    _id: `${_id}`,
    title: '',
    create: moment(now).format('YYYY-MM-DD HH:mm'),
    modify: moment(now).format('YYYY-MM-DD HH:mm'),
    categories: [],
    image: ''
  });
  const data = `---\n${frontMatter}---\n<!-- more -->\n`;

  fs.writeFile(filepath, data, (err) => {
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
gulp.task('posts:edit', (done) => {
  const input = process.argv.slice(4)[0].split(' ');
  console.log(input);

  const promises = [];

  input.forEach((val) => {

    const p = new Promise((resolve, reject) => {
      db.archives.find({_id: new ObjectId(val)}, (err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
    }).then((docs) => {
      const doc = docs[0];
      const filepath = `./data/${doc._id}.md`;
      const frontMatter = yaml.safeDump({
        _id: `${doc._id}`,
        title: doc.title,
        create: moment(doc.create).format('YYYY-MM-DD HH:mm'),
        modify: moment(new Date()).format('YYYY-MM-DD HH:mm'),
        categories: doc.categories,
        image: doc.image ? doc.image : ''
      });
      const data = `---\n${frontMatter}---\n${doc.body}`;

      return new Promise((resolve, reject) => {
        fs.writeFile(filepath, data, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log(`Creating arcive: ${filepath}\n`);
            resolve();
          }
        });
      });
    });
    promises.push(p);
  });

  Promise.all(promises).then(() => {
    done();
    process.exit();
  });
});


// upsert
gulp.task('posts:upsert', (done) => {
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
