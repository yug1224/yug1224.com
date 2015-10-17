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

  field =
    _id: 1
    title: 1
    date: 1
    categories: 1
  sort = date: -1

  Promise.all [
    common.getCategories()
    common.getPosts({}, field, sort, {}, {})
  ]
    .then (results) ->
      console.log results[0]
      console.log results[1]

      posts = results[1]

      if posts.length is 0
        res.sendStatus(404)
      else
        for post in posts
          post.datetime = moment(post.date).format  "YYYY-MM-DD HH:mm"
          post.date = moment(post.date).format "MMM DD, YYYY"

        data =
          title: config.blog.title
          categories: results[0]
          posts: posts
          image: config.twitter.image

        data.ogp =
          card: config.twitter.card
          site: config.twitter.site
          title: config.blog.title
          description: config.blog.description
          type: "blog"
          image: config.twitter.image
          url: config.blog.url

        res.status(200).render "archive", data
      return
    .catch (err) ->
      res.status(500).send(err)
      return
  return
