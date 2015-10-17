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
  sort = date: -1
  limit = 5
  skip = limit * ( page - 1)

  Promise.all [
    common.getCategories()
    common.getPosts({}, {}, sort, skip, limit)
    common.getCount({}, sort, skip+limit, limit)
  ]
    .then (results) ->
      posts = results[1]

      if posts.length is 0
        res.sendStatus(404)
      else
        for post in posts
          post.datetime = moment(post.date).format  "YYYY-MM-DD HH:mm"
          post.date = moment(post.date).format "MMM DD, YYYY"
          post.body = md post.body
          post.intro = post.body.split("<!-- more -->")[0]

        data =
          title: config.blog.title
          categories: results[0]
          posts: posts
          image: config.twitter.image

        if results[2] > 0
          data.prev = "/pages/#{page + 1}"
        if page > 2
          data.next = "/pages/#{page - 1}"
        else if page is 2
          data.next = "/"

        data.ogp =
          card: config.twitter.card
          site: config.twitter.site
          title: config.blog.title
          description: config.blog.description
          type: "blog"
          image: config.twitter.image
          url: config.blog.url

        res.status(200).render "page", data
      return
    .catch (err) ->
      res.status(500).send(err)
      return
  return
