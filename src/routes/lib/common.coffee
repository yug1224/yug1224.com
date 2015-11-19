Promise = require("q").Promise
mongojs = require "mongojs"
ObjectId = mongojs.ObjectId
db = mongojs "blog", ["archives"]
# Datastore = require "nedb"
# db = {}
# db.archives = new Datastore
#   filename: "./src/data/archives.db"
#   autoload: true

exports.setArchives = setArchives = (query, data) ->
  return new Promise (resolve, reject) ->
    if query
      db.archives.update query, data, (err, results) ->
        if err then reject err else resolve results
        return
    else
      db.archives.insert data, (err, results) ->
        if err then reject err else resolve results
        return
    return

exports.removeArchives = removeArchives = (query) ->
  return new Promise (resolve, reject) ->
    db.archives.remove query, (err, results) ->
      if err then reject err else resolve results
      return
    return

exports.getArchives = getArchives = (query, field, sort, skip, limit) ->
  return new Promise (resolve, reject) ->
    if query._id
      query._id = new ObjectId query._id

    db.archives.find query, field
      .sort sort
      .skip skip
      .limit limit, (err, results) ->
        if err then reject err else resolve results
        return

exports.getCount = getCount = (query, sort, skip, limit) ->
  return new Promise (resolve, reject) ->
    db.archives.find query, _id: 1
      .sort sort
      .skip skip
      .limit limit
      .count (err, results) ->
        if err then reject err else resolve results
        return

  # return getArchives query, _id: 1, sort, skip, limit
  #   .then (data) ->
  #     return data.length

exports.getNext = getNext = (query) ->
  field =
    _id: 1
    title: 1
    create: 1
  return getArchives query, field, {}, null, 1
    .then (docs) ->
      data = docs[0]

      query =
        create:
          $lt: data.create
      field =
        title: 1
        create: 1
      sort =
        create: -1
      return getArchives query, field, sort, 0, 1

exports.getPrev = getPrev = (query) ->
  field =
    _id: 1
    title: 1
    create: 1
  return getArchives query, field, {}, null, 1
    .then (docs) ->
      data = docs[0]

      query =
        create:
          $gt: data.create
      field =
        title: 1
        create: 1
      sort =
        create: 1
      return getArchives query, field, sort, 0, 1

exports.getCategories = getCategories = () ->
  return new Promise (resolve, reject) ->
    operators = []
    operators.push $project:categories: 1
    operators.push $unwind: "$categories"
    operators.push $sort: categories: -1
    operators.push $group: _id: "$categories", count: $sum: 1
    operators.push $sort: count: -1
    db.archives.aggregate operators, (err, results) ->
      if err then reject err else resolve results
      return

# exports.getCategories = getCategories = () ->
#   return new Promise (resolve, reject) ->
#     query = {}
#     field =
#       categories: 1
#     db.archives.find query, field, (err, results) ->
#       if err
#         reject err
#       else
#         data = {}
#         for val in results
#           for category in val.categories
#             if data[category]
#               data[category] += 1
#             else
#               data[category] = 1
#
#         categories = []
#         for key, val of data
#           categories.push
#             _id: key
#             count: val
#
#         categories = categories.sort (a, b) ->
#           if a.count > b.count
#             return -1
#           if a.count < b.count
#             return 1
#           return 0
#
#         resolve categories
#       return
