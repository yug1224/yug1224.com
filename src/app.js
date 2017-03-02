const bodyParser = require('body-parser');
const cache = require('memory-cache');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const express = require('express');
const http = require('http');
const config = require(`${__dirname}/config`);

const app = express();
const server = http.createServer(app);

app.set('port', config.port);
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');
app.set('x-powered-by', false);
app.use(compression({
  level: 6
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

// cache
app.use((req, res, next) => {
  const memory = cache.get(req.url);

  if (memory) {
    Object.keys(memory.headers || {}).forEach((key) => {
      const val = memory.headers[key];
      res.set(key, val);
    });
    if (memory.view) {
      res.status(memory.status).render(memory.view, memory.data);
    } else {
      res.status(memory.status).send(memory.data);
    }
  } else {
    next();
  }
});

// 昔のURLをリダイレクト
const redirect = require('./routes/redirect');
app.use((req, res, next) => {
  const url = req.url.replace(/\/$/, '');

  if (['GET', 'HEAD'].indexOf(req.method) >= 0 && redirect[url]) {
    res.redirect(301, `/archives${redirect[url]}`);
  }

  next();
});

// analytics trackingIDを追加
app.use((req, res, next) => {
  res.locals.analytics = config.GoogleAnalytics;
  next();
});

// URLルーティング
const pages = require('./routes/pages');
const archives = require('./routes/archives');
const categories = require('./routes/categories');
const images = require('./routes/images');
const apps = require('./routes/apps');
const xml = require('./routes/xml');

app.get('/', pages.show);
app.get('/pages/:page', pages.show);
app.get('/archives', archives.index);
app.get('/archives/:_id', archives.show);
app.get('/categories/:category', categories.show);
app.get('/images/:yyyy/:mm/:dd/:filename', images.show);
app.get('/apps', apps.index);
app.get('/atom.xml', xml.atom);
app.get('/sitemap.xml', xml.sitemap);
app.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.status(200).render('robots', config);
});
app.get('/favicon.png', (req, res) => {
  res.sendFile(`${__dirname}/favicon.png`);
});

app.use(express.static(`${__dirname}/../dst`, {
  maxAge: config.maxAge
}));

app.use((req, res) => {
  const data = {
    blog: config.blog,
    status: 404,
    content: 'Page Not Found'
  };
  res.status(404).render('error', data);
});

server.listen(app.get('port'), () => {
  console.log(`Server listen on port ${app.get('port')}`);

  return;
});
