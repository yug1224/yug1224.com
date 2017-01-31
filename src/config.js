const config = {
  port: 7826,
  blog: {
    url: 'https://blog.yug1224.com',
    title: 'YuG1224 blog',
    author: 'YuG1224',
    description: 'プログラミングやカメラや日常のこと。'
  },
  GoogleAnalytics: {
    trackingID: 'UA-43402891-1',
    domain: 'blog.yug1224.com'
  },
  twitter: {
    card: 'summary',
    site: '@YuG1224',
    image: 'https://db.tt/Nfw3zxcJ'
  },
  maxAge: 1 * 1000 * 60 * 60 * 24 * 30
};

module.exports = config;
