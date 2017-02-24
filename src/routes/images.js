const cache = require('memory-cache');
const gm = require('gm').subClass({imageMagick: true});
const request = require('request');

exports.show = (req, res) => {
  Promise.resolve().then(() => {
    return new Promise((resolve, reject) => {
      const {yyyy, mm, dd, filename} = req.params;
      const {w, h} = req.query;
      const file = `${yyyy}/${mm}/${dd}/${filename}`;
      const url = `https://dl.dropboxusercontent.com/u/3189929/images/${file}`;

      gm(request(url)).resize(w, h).toBuffer('PNG', (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
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
