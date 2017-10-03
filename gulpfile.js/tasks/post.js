const Promise = require('bluebird');
const glob = require('glob');
const fm = require('front-matter');
const fs = require('fs');
const gulp = require('gulp');
const yaml = require('js-yaml');
const format = require('date-fns/format');
const mkdirp = require('mkdirp');
const mongojs = require('mongojs');
const path = require('path');

const db = mongojs('blog', ['archives']);
const ObjectId = mongojs.ObjectId;


// Create new post
gulp.task('posts:new', (done) => {
  const now = new Date();
  const _id = new ObjectId();
  const filepath = path.resolve(`./data/${format(now, 'YYYY/MM/DD/')}`);
  const filename = `${_id}.md`;
  const frontMatter = yaml.safeDump({
    _id: `${_id}`,
    title: '',
    create: format(now, 'YYYY-MM-DD HH:mm'),
    modify: format(now, 'YYYY-MM-DD HH:mm'),
    categories: [],
    image: ''
  });
  const data = `---\n${frontMatter}---\n<!-- more -->\n`;

  mkdirp.sync(filepath);
  fs.writeFile(`${filepath}/${filename}`, data, (err) => {
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
      const filepath = path.resolve(`./data/${format(doc.create, 'YYYY/MM/DD/')}`);
      const filename = `${doc._id}.md`;
      const frontMatter = yaml.safeDump({
        _id: `${doc._id}`,
        title: doc.title,
        create: format(doc.create, 'YYYY-MM-DD HH:mm'),
        modify: format(new Date(), 'YYYY-MM-DD HH:mm'),
        categories: doc.categories,
        image: doc.image ? doc.image : ''
      });
      const data = `---\n${frontMatter}---\n${doc.body}`;

      return new Promise((resolve, reject) => {
        mkdirp.sync(filepath);
        fs.writeFile(`${filepath}/${filename}`, data, (err) => {
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

// dump post
gulp.task('posts:dump', (done) => {
  new Promise((resolve, reject) => {
    db.archives.find({}, (err, docs) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs);
      }
    });
  }).then((docs) => {
    const promises = [];

    docs.forEach((doc) => {
      const filepath = path.resolve(`./data/${format(doc.create, 'YYYY/MM/DD/')}`);
      const filename = `${doc._id}.md`;
      const frontMatter = yaml.safeDump({
        _id: `${doc._id}`,
        title: doc.title,
        create: format(doc.create, 'YYYY-MM-DD HH:mm'),
        modify: format(doc.modify, 'YYYY-MM-DD HH:mm'),
        categories: doc.categories,
        image: doc.image ? doc.image : ''
      });
      const data = `---\n${frontMatter}---\n${doc.body}`;

      const p = new Promise((resolve, reject) => {
        mkdirp.sync(filepath);
        fs.writeFile(`${filepath}/${filename}`, data, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log(`Creating arcive: ${filepath}\n`);
            resolve();
          }
        });
      });
      promises.push(p);
    });

    return Promise.all(promises);
  }).then(() => {
    done();
    process.exit();
  });
});

// upsert
gulp.task('posts:upsert', (done) => {
  const promises = [];
  const files = glob.sync(path.resolve('data/**/*.md'));

  const sort = (a, b) => {
    return a > b ? 1 : -1;
  };

  files.forEach((val) => {
    promises.push(new Promise((resolve, reject) => {
      const data = fm(fs.readFileSync(val, 'utf8'));
      const attr = data.attributes;
      const doc = {
        title: attr.title,
        create: new Date(attr.create),
        modify: new Date(attr.modify),
        categories: attr.categories.sort(sort),
        image: attr.image,
        body: data.body
      };
      const opts = {
        query: {_id: new ObjectId(attr._id)},
        update: doc,
        upsert: true
      };
      db.archives.findAndModify(opts, (err, doc) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(doc);
        }
      });
    }));
  });

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
