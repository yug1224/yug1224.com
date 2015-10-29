Promise = require("q").Promise
moment = require "moment"
md = require "marked"
md.setOptions
  highlight: (code) ->
    return require('highlight.js').highlightAuto(code).value

config = require "../config"
common = require "./lib/common"

exports.index = (req, res) ->
  res.locals.lang = "ja"

  field =
    _id: 1
    title: 1
    date: 1
    categories: 1
  sort =
    date: -1

  Promise.all [
    common.getCategories()
    common.getArchives({}, field, sort, null, null)
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
            title: "Archives - #{config.blog.title}"
          title: "Archives"
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

        res.status(200).render "archives_index", data
      return
    .catch (err) ->
      res.status(500).send(err)
      return
  return

exports.show = (req, res) ->
  res.locals.lang = "ja"

  query =
    _id: req.params._id
  field =
    title: 1
    date: 1
  limit = 1

  Promise.all [
    common.getCategories()
    common.getArchives query, {}, {}, null, limit
    common.getPrev query
    common.getNext query
    # common.getArchives query, field, date: -1, null, limit
    # common.getArchives query, field, date: 1, null, limit
  ]
    .then (results) ->
      archive = results[1][0]
      prev = results[2][0]
      next = results[3][0]

      unless archive
        res.sendStatus(404)
      else
        archive.datetime = moment(archive.date).format  "YYYY-MM-DD HH:mm"
        archive.date = moment(archive.date).format "MMM DD, YYYY"
        archive.body = md archive.body

        data =
          blog:
            title: "#{archive.title} - #{config.blog.title}"
          title: archive.title
          categories: results[0]
          archive: archive
          prev: prev
          next: next

        data.ogp =
          card: config.twitter.card
          site: config.twitter.site
          title: data.title
          description: archive.body.replace /<("[^"]*"|'[^']*'|[^'">])*\>/g, ""
            .replace "\r\n", " "
            .replace /\n|\r/g, " "
            .slice 0, 200
          type: "article"
          image: if archive.image then archive.image else config.twitter.image
          url: "#{config.blog.url}/archives/#{archive._id}"

        res.status(200).render "archives_show", data

      return
    .catch (err) ->
      console.log err.stack
      res.status(500).send(err)
      return
  return

exports.new = (req, res) ->
  res.locals.lang = "ja"

  data =
    archive:
      _id: null
      datetime: moment(new Date()).format "YYYY-MM-DD HH:mm"
      categories: []
      title: ""
      body: ""
      image: null

  res.status(200).render "archives_upsert", data
  return

exports.edit = (req, res) ->
  res.locals.lang = "ja"

  query =
    _id: req.params._id
  common.getArchives(query, {}, {}, null, 1)
    .then (results) ->
      archive = results[0]
      unless archive
        res.sendStatus(404)
      else
        data =
          archive:
            _id: archive._id
            datetime: moment(archive.date).format "YYYY-MM-DD HH:mm"
            categories: archive.categories
            title: archive.title
            body: archive.body
            image: archive.image
        res.status(200).render "archives_upsert", data
      return
    .catch (err) ->
      console.log err.stack
      res.sendStatus(500)
      return
  return
exports.create = (req, res) ->
  res.locals.lang = "ja"

  data = req.body
  data.date = new Date data.date
  data.categories = if data.categories then data.categories.split(",") else []

  common.setArchives {}, data
    .then (results) ->
      res.sendStatus(200)
    .catch (err) ->
      res.sendStatus(500)
  return
exports.update = (req, res) ->
  res.locals.lang = "ja"

  query =
    _id: req.params._id
  data = req.body
  data.date = new Date data.date
  data.categories = if data.categories then data.categories.split(",") else []

  common.setArchives query, data
    .then (results) ->
      res.sendStatus(200)
    .catch (err) ->
      console.log err.stack
      res.sendStatus(500)
  return
exports.destroy = (req, res) ->
  res.locals.lang = "ja"

  query =
    _id: req.params._id
  common.removeArchives query
    .then (results) ->
      res.sendStatus(200)
    .catch (err) ->
      console.log err.stack
      res.sendStatus(500)
  return
