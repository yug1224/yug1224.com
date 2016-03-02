Promise = require("q").Promise
moment = require "moment"
config = require "../config"
common = require "./lib/common"

exports.index = (req, res) ->
  res.locals.lang = "ja"

  Promise.all [
    common.getCategories()
    common.getApps()
  ]
    .then (results) ->
      apps = results[1]

      if apps.length is 0
        data =
          blog: config.blog
          status: 404
          content: "Page Not Found"
        res.status(404).render "error", data
      else

        data =
          blog:
            title: "Apps - #{config.blog.title}"
          title: "Apps"
          categories: results[0]
          apps: apps
          image: config.twitter.image

        data.ogp =
          card: config.twitter.card
          site: config.twitter.site
          title: data.title
          description: config.blog.description
          type: "blog"
          image: config.twitter.image
          url: config.blog.url

        res.status(200).render "apps_index", data
      return
    .catch (err) ->
      data =
        status: 500
        content: "Internal Server Error"
      res.status(500).render "error", data
      return
  return
