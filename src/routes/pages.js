const cache = require('memory-cache');
const format = require('date-fns/format');
const md = require('marked');
md.setOptions({
  highlight(code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});

const config = require('../config');
const common = require('./lib/common');

exports.show = (req, res) => {
  res.locals.lang = 'ja';

  const query = {
    create: {
      $lt: new Date()
    }
  };
  const page = req.params.page ? +req.params.page : 1;
  const sort = {create: -1};
  const limit = 5;
  const skip = limit * ( page - 1);

  Promise.all([
    common.getCategories(),
    common.getArchives(query, {}, sort, skip, limit),
    common.getCount(query, sort, skip + limit, limit)
  ]).then((results) => {
    const archives = results[1];
    const data = {};

    if (archives.length === 0) {
      data.blog = config.blog;
      data.status = 404;
      data.content = 'Page Not Found';
      res.status(404).render('error', data);
    } else {
      for (let i = 0; i < archives.length; i++) {
        const archive = archives[i];
        archive.datetime = format(archive.create, 'YYYY-MM-DD HH:mm');
        archive.date = format(archive.create, 'MMM DD, YYYY');
        archive.body = md(archive.body);
        archive.intro = archive.body.split('<!-- more -->')[0];
      }

      data.blog = {
        title: config.blog.title
      };
      data.title = config.blog.title;
      data.categories = results[0];
      data.archives = archives;
      data.image = config.twitter.image;

      if (results[2] > 0) {
        data.next = `/pages/${page + 1}`;
      }
      if (page > 2) {
        data.prev = `/pages/${page - 1}`;
      } else if (page === 2) {
        data.prev = '/';
      }

      data.ogp = {
        card: config.twitter.card,
        site: config.twitter.site,
        title: config.blog.title,
        description: config.blog.description,
        type: 'blog',
        image: config.twitter.image,
        url: config.blog.url
      };

      cache.put(req.url, {
        data: data,
        status: 200,
        view: 'pages_show'
      });
      res.status(200).render('pages_show', data);
    }
  }).catch((err) => {
    console.log(err.stack);
    const data = {
      blog: config.blog,
      status: 500,
      content: 'Internal Server Error'
    };
    res.status(500).render('error', data);
  });
};
