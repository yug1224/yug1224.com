config = require "../config"

exports.categories = (req, res) ->
  res.locals.lang = "ja"
  res.locals.title = config.blog.title
  res.render "categories"
