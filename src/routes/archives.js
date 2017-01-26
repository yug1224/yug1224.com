const moment = require('moment');
const md = require('marked');
md.setOptions({
  highlight(code) {
    return require('highlight.js').highlightAuto(code).value;
  }
});
const config = require('../config');
const common = require('./lib/common');

exports.index = (req, res) => {
  res.locals.lang = 'ja';

  const field = {
    _id: 1,
    title: 1,
    create: 1,
    categories: 1
  };
  const sort = { create: -1 };

  Promise.all([
    common.getCategories(),
    common.getArchives({}, field, sort, null, null)
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
      }

      data.blog = {
        title: `Archives - ${config.blog.title}`
      };
      data.title = 'Archives';
      data.categories = results[0];
      data.archives = archives;
      data.image = config.twitter.image;

      data.ogp = {
        card: config.twitter.card,
        site: config.twitter.site,
        title: data.title,
        description: config.blog.description,
        type: 'blog',
        image: config.twitter.image,
        url: config.blog.url
      };

      res.status(200).render('archives_index', data);
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

exports.show = (req, res) => {
  res.locals.lang = 'ja';

  const query = {
    _id: req.params._id
  };
  const limit = 1;

  Promise.all([
    common.getCategories(),
    common.getArchives(query, {}, {}, null, limit),
    common.getPrev(query),
    common.getNext(query)
  ]).then((results) => {
    const archive = results[1][0];
    const prev = results[2][0];
    const next = results[3][0];
    const data = {};

    if (!archive) {
      data.status = 404;
      data.content = 'Page Not Found';
      res.status(404).render('error', data);
    } else {
      archive.datetime = moment(archive.create).format('YYYY-MM-DD HH:mm');
      archive.date = moment(archive.create).format('MMM DD, YYYY');
      archive.body = md(archive.body);

      data.blog = {
        title: `${archive.title} - ${config.blog.title}`
      };
      data.title = archive.title;
      data.categories = results[0];
      data.archive = archive;
      data.image = config.twitter.image;
      data.prev = prev;
      data.next = next;

      data.ogp = {
        card: config.twitter.card,
        site: config.twitter.site,
        title: data.title,
        description: archive.body.replace(/<("[^"]*"|'[^']*'|[^'">])*\>/g, '')
          .replace('\r\n', ' ')
          .replace(/\n|\r/g, ' ')
          .slice(0, 200),
        type: 'article',
        image: archive.image ? archive.image : config.twitter.image,
        url: `${config.blog.url}/archives/${archive._id}`
      };
      data.analytics = config.GoogleAnalytics;

      res.status(200).render('archives_show', data);
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
