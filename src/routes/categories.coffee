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

  query =
    categories: req.params.category
  field =
    _id: 1
    title: 1
    create: 1
    categories: 1
  sort =
    create: -1

  Promise.all [
    common.getCategories()
    common.getArchives(query, field, sort, null, null)
  ]
    .then (results) ->
      archives = results[1]

      if archives.length is 0
        res.sendStatus(404)
      else
        for archive in archives
          archive.datetime = moment(archive.date).format  "YYYY-MM-DD HH:mm"
          archive.date = moment(archive.date).format "MMM DD, YYYY"

        data =
          blog:
            title: "Category: #{req.params.category} - #{config.blog.title}"
          title: "Category: #{req.params.category}"
          categories: results[0]
          archives: archives
          image: config.twitter.image

        data.ogp =
          card: config.twitter.card
          site: config.twitter.site
          title: data.title
          description: config.blog.description
          type: "blog"
          image: config.twitter.image
          url: config.blog.url

        res.status(200).render "categories_show", data
      return
    .catch (err) ->
      res.status(500).send(err)
      return
  return
