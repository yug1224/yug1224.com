const Promise = require('bluebird');
const cache = require('memory-cache');
const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true});
const path = require('path');

exports.show = (req, res) => {
  Promise.resolve().then(() => {
    const {yyyy, mm, dd, filename} = req.params;
    const {w, h} = req.query;
    const file = `${yyyy}/${mm}/${dd}/${filename}`;
    const filePath = path.resolve('dst/images', file);

    if (!w && !h) {
      return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    } else {
      return new Promise((resolve, reject) => {
        gm(filePath).resize(w, h).toBuffer('PNG', (err, buffer) => {
          if (err) {
            reject(err);
          } else {
            resolve(buffer);
          }
        });
      });
    }
  }).then((data) => {
    cache.put(req.url, {
      data: data,
      headers: {
        'Content-Type': 'image/png'
      },
      status: 200
    });
    res.set('Content-Type', 'image/png');
    res.status(200).send(data);
  }).catch((err) => {
    console.log(err.stack);
    res.sendStatus(500);
  });
};
