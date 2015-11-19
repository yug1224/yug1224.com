Promise = require("q").Promise
moment = require "moment"
md = require "marked"
md.setOptions
  highlight: (code) ->
    return require('highlight.js').highlightAuto(code).value

config = require "../config"
common = require "./lib/common"

exports.show = (req, res) ->
  res.locals.lang = "ja"

  page = if req.params.page then +req.params.page else 1
  sort = create: -1
  limit = 5
  skip = limit * ( page - 1)

  Promise.all [
    common.getCategories()
    common.getArchives({}, {}, sort, skip, limit)
    common.getCount({}, sort, skip+limit, limit)
  ]
    .then (results) ->
      archives = results[1]

      if archives.length is 0
        data =
          blog: config.blog
          status: 404
          content: "Page Not Found"
        res.status(404).render "error", data
      else
        for archive in archives
          archive.datetime = moment(archive.create).format  "YYYY-MM-DD HH:mm"
          archive.date = moment(archive.create).format "MMM DD, YYYY"
          archive.body = md archive.body
          archive.intro = archive.body.split("<!-- more -->")[0]

        data =
          blog:
            title: config.blog.title
          title: config.blog.title
          categories: results[0]
          archives: archives
          image: config.twitter.image

        if results[2] > 0
          data.next = "/pages/#{page + 1}"
        if page > 2
          data.prev = "/pages/#{page - 1}"
        else if page is 2
          data.prev = "/"

        data.ogp =
          card: config.twitter.card
          site: config.twitter.site
          title: config.blog.title
          description: config.blog.description
          type: "blog"
          image: config.twitter.image
          url: config.blog.url

        res.status(200).render "pages_show", data
      return
    .catch (err) ->
      console.log err.stack
      data =
        blog: config.blog
        status: 500
        content: "Internal Server Error"
      res.status(500).render "error", data
      return
  return
