Datastore = require "nedb"
db = {}
db.archives = new Datastore
  filename: "./src/data/archives.db"
  autoload: true

db.archives.find {}, (err, docs) ->
  console.log err, docs
