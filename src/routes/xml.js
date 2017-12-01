const cache = require('memory-cache');

const config = require('../config');
const common = require('./lib/common');
const md = require('marked');

exports.atom = (req, res) => {
  const query = {
    create: {
      $lt: new Date()
    }
  };
  const field = {
    _id: 1,
    modify: 1,
    create: 1,
    title: 1,
    body: 1
  };
  const sort = {
    create: -1
  };
  const limit = 10;

  return common.getArchives(query, field, sort, null, limit).then((results) => {
    const data = {
      blog: config.blog,
      archives: results
    };
    for (let i = 0; i < data.archives.length; i++) {
      const val = data.archives[i];
      val.body = md(val.body).replace(/<("[^"]*"|'[^']*'|[^'">])*>/g, '')
        .replace('\r\n', ' ')
        .replace(/\n|\r/g, ' ')
        .slice(0, 200);

      val.loc = `${config.blog.url}/archives/${val._id}`;
      val.modify = val.modify.toISOString();
      if (!data.blog.modify) {
        data.blog.modify = val.modify;
      }
      if (data.blog.modify < val.modify) {
        data.blog.modify = val.modify;
      }
    }

    cache.put(req.url, {
      data: data,
      headers: {
        'Content-Type': 'text/xml'
      },
      status: 200,
      view: 'atom'
    });
    res.set('Content-Type', 'text/xml');
    res.status(200).render('atom', data);

    return;
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

exports.sitemap = (req, res) => {
  const query = {
    create: {
      $lt: new Date()
    }
  };
  const field = {
    _id: 1,
    modify: 1
  };
  const sort = {
    create: -1
  };

  common.getArchives(query, field, sort, null, null).then((results) => {
    const data = { archives: results };
    for (let i = 0; i < data.archives.length; i++) {
      const val = data.archives[i];
      val.loc = `${config.blog.url}/archives/${val._id}`;
      val.modify = val.modify.toISOString();
    }

    cache.put(req.url, {
      data: data,
      headers: {
        'Content-Type': 'text/xml'
      },
      status: 200,
      view: 'sitemap'
    });
    res.set('Content-Type', 'text/xml');
    res.status(200).render('sitemap', data);

    return;
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
