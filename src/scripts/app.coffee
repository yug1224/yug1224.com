window.jQuery = window.$ = require "jquery"
require "bootstrap"
hljs = require "highlight.js"
request = require "request"

$ () ->
  hljs.initHighlightingOnLoad()
  return

$("#upsert").click () ->
  _id = $("#_id").val()
  datetime = $("#datetime").val()
  categories = $("#categories").val()
  title = $("#title").val()
  body = $("#body").val()
  image = $("#image").val()

  opt =
    form:
      date: if datetime then new Date(datetime) else new Date()
      categories: categories
      title: title
      body: body
      image: if image then image else null

  if _id
    opt.url = "#{location.origin}/archives/#{_id}"
    opt.method = "PUT"
  else
    opt.url = "#{location.origin}/archives"
    opt.method = "POST"

  request opt, (err, response, body) ->
    location.href = "/archives"
    return
  return

$("#destroy").click () ->
  _id = $("#_id").val()
  opt =
    url: "#{location.origin}/archives/#{_id}"
    method: "DELETE"
  request opt, (err, response, body) ->
    location.href = "/archives"
    return
  return
