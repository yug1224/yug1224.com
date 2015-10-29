Promise = require("q").Promise

mongojs = require "mongojs"
mdb = mongojs "blog", ["archives"]

nedb = require "nedb"
ndb = new nedb
  filename: "./src/data/data.db"
  autoload: true

Promise
  .resolve()
  .then () ->
    Promise (resolve, reject) ->
      mdb.archives.find (err, results) ->
        if err then reject err else resolve results
  .then (archives) ->
    Promise (resolve, reject) ->
      docs = []
      for val in archives
        delete val._id
        docs.push val
      ndb.insert docs, (err) ->
        if err then reject err else resolve()
  .then () ->
    console.log "success"
  .catch (err) ->
    console.log err
