const cache = require('memory-cache');

const config = require('../config');
const common = require('./lib/common');

exports.index = (req, res) => {
  res.locals.lang = 'ja';

  Promise.all([
    common.getCategories(),
    common.getApps()
  ]).then((results) => {
    const apps = results[1];
    let data = {};

    if (apps.length === 0) {
      data = {
        blog: config.blog,
        status: 404,
        content: 'Page Not Found'
      };
      res.status(404).render('error', data);
    } else {
      data = {
        blog: {
          title: `Apps - ${config.blog.title}`
        },
        title: 'Apps',
        categories: results[0],
        apps,
        image: config.twitter.image
      };

      data.ogp = {
        card: config.twitter.card,
        site: config.twitter.site,
        title: data.title,
        description: config.blog.description,
        type: 'blog',
        image: config.twitter.image,
        url: config.blog.url
      };

      cache.put(req.url, {
        data: data,
        status: 200,
        view: 'apps_index'
      });
      res.status(200).render('apps_index', data);
    }
  }).catch((err) => {
    console.error(err);
    const data = {
      status: 500,
      content: 'Internal Server Error'
    };
    res.status(500).render('error', data);
  });
};
