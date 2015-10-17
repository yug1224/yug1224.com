Promise = require("q").Promise
moment = require "moment"
md = require "marked"
md.setOptions
  highlight: (code) ->
    return require('highlight.js').highlightAuto(code).value
mongojs = require "mongojs"
config = require "../config"
common = require "./lib/common"

exports.show = (req, res) ->
  res.locals.lang = "ja"

  query =
    _id: mongojs.ObjectId req.params._id
  field =
    title: 1
  limit = 1

  Promise.all [
    common.getCategories()
    common.getPosts query, {}, {}, {}, limit
    common.getPosts _id: $lt: query._id, field, date: -1, {}, limit
    common.getPosts _id: $gt: query._id, field, date: 1, {}, limit
  ]
    .then (results) ->
      post = results[1][0]
      prev = results[2][0]
      next = results[3][0]

      unless post
        res.sendStatus(404)
      else
        post.datetime = moment(post.date).format  "YYYY-MM-DD HH:mm"
        post.date = moment(post.date).format "MMM DD, YYYY"
        post.body = md post.body

        data =
          title: "#{post.title} - #{config.blog.title}"
          categories: results[0]
          post: post
          prev: prev
          next: next

        data.ogp =
          card: config.twitter.card
          site: config.twitter.site
          title: data.title
          description: post.body.replace /<("[^"]*"|'[^']*'|[^'">])*\>/g, ""
            .replace "\r\n", " "
            .replace /\n|\r/g, " "
            .slice 0, 200
          type: "article"
          image: if post.image then post.image else config.twitter.image
          url: "#{config.blog.url}/posts/#{post._id}"

        res.status(200).render "post", data

      return
    .catch (err) ->
      res.status(500).send(err)
      return
  return
