const imagemagick = require('imagemagick-native');
const https = require('https');

exports.show = (req, res) => {
  Promise.resolve().then(() => {
    return new Promise((resolve) => {
      const url = `https://dl.dropboxusercontent.com/u/3189929/images/${req.params._id}`;
      https.get(url, (res) => {
        const data = [];
        res.on('data', (chunk) => {
          data.push(chunk);
        });
        res.on('end', () => {
          resolve(Buffer.concat(data));
        });
      });
    });
  }).then((data) => {
    return new Promise((resolve, reject) => {
      const options = {
        srcData: data,
        width: req.query.w,
        height: req.query.h,
        format: 'png',
        resizeStyle: 'aspectfit'
      };
      imagemagick.convert(options, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }).then((data) => {
    res.set('Content-Type', 'image/png');
    res.status(200).send(data);
  }).catch((err) => {
    console.log(err.stack);
    res.sendStatus(500);
  });
};
