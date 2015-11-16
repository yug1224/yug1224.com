Promise = require("q").Promise
moment = require "moment"
ObjectId = require("mongojs").ObjectId
config = require "../config"
common = require "./lib/common"
md = require "marked"

exports.atom = (req, res) ->
  field =
    _id: 1
    modify: 1
    create: 1
    title: 1
    body: 1
  sort =
    create: -1

  common.getArchives({}, field, sort, null, null)
    .then (results) ->
      data =
        blog: config.blog
        archives: results
      for val in data.archives
        val.body = md(val.body).replace /<("[^"]*"|'[^']*'|[^'">])*\>/g, ""
          .replace "\r\n", " "
          .replace /\n|\r/g, " "
          .slice 0, 200

        val.loc = "#{config.blog.url}/archives/#{val._id}"
        val.modify = moment(val.modify).toISOString()
        unless data.blog.modify
          data.blog.modify = val.modify
        if data.blog.modify < val.modify
          data.blog.modify = val.modify

      res.set "Content-Type", "text/xml"
      res.status(200).render "atom", data
      return
    .catch (err) ->
      res.status(500).send(err)
      return
  return

exports.sitemap = (req, res) ->
  field =
    _id: 1
    modify: 1
  sort =
    create: -1

  common.getArchives({}, field, sort, null, null)
    .then (results) ->
      data =
        archives: results
      for val in data.archives
        val.loc = "#{config.blog.url}/archives/#{val._id}"
        val.modify = moment(val.modify).toISOString()
        console.log val.modify
      res.set "Content-Type", "text/xml"
      res.status(200).render "sitemap", data
      return
    .catch (err) ->
      res.status(500).send(err)
      return
  return
