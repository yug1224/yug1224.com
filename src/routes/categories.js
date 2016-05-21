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

  const query = {
    categories: req.params.category
  };
  const field = {
    _id: 1,
    title: 1,
    create: 1,
    categories: 1
  };
  const sort = {
    create: -1
  };

  Promise.all([
    common.getCategories(),
    common.getArchives(query, field, sort, null, null)
  ]).then(function(results) {
    let archives = results[1];
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
        title: `Category: ${req.params.category} - ${config.blog.title}`
      };
      data.title = `Category: ${req.params.category}`;
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

      res.status(200).render('categories_show', data);
    }
  }).catch(function(err) {
    console.log(err.stack);
    const data = {
      blog: config.blog,
      status: 500,
      content: 'Internal Server Error'
    };
    res.status(500).render('error', data);
  });
};
