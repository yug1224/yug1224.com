fs = require "fs"
fm = require "front-matter"
moment = require "moment"

mongojs = require "mongojs"
db = mongojs "blog", ["archives"]
ObjectId = mongojs.ObjectId

files = []
fs.readdirSync("./data").forEach (val) ->
  if val.match /\.md/ then files.push val

for val in files
  data = fm fs.readFileSync "./data/#{val}", "utf8"
  attr = data.attributes
  date = moment(attr.date, "YYYY-MM-DD HH:mm").toDate()
  doc =
    _id: new ObjectId attr._id
    title: attr.title
    create: date
    modify: date
    categories: attr.categories
    image: attr.image
    body: data.body
  db.archives.insert doc
db.archives.count {}, (err, docs) ->
  console.log err, docs
