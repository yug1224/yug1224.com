const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const express = require('express');
const http = require('http');
const config = require(`${__dirname}/config`);

const app = express();
const server = http.createServer(app);

app.set('port', config.port);
app.set('views', `${__dirname}/views`);
app.set('view engine', 'jade');
app.set('x-powered-by', false);
app.use(compression({
  level: 1
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());

// 昔のURLをリダイレクト
const redirect = require('./routes/redirect');
app.use((req, res, next) => {
  let url = req.url;
  url = url.replace(/\/$/, '');

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
const apps = require('./routes/apps');
const xml = require('./routes/xml');

app.get('/', pages.show);
app.get('/pages/:page', pages.show);
app.get('/archives', archives.index);
app.get('/archives/:_id', archives.show);
app.get('/categories/:category', categories.show);
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

app.use(express.static(`${__dirname}/../dst`));

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
