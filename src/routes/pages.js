const moment = require('moment');
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

  const page = req.params.page ? +req.params.page : 1;
  const sort = {create: -1};
  const limit = 5;
  const skip = limit * ( page - 1);

  Promise.all([
    common.getCategories(),
    common.getArchives({}, {}, sort, skip, limit),
    common.getCount({}, sort, skip + limit, limit)
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
        archive.datetime = moment(archive.create).format('YYYY-MM-DD HH:mm');
        archive.date = moment(archive.create).format('MMM DD, YYYY');
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
