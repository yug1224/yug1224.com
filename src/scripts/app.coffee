window.jQuery = window.$ = require "jquery"
require "bootstrap"
hljs = require "highlight.js"

$ () ->
  hljs.initHighlightingOnLoad()
  return
