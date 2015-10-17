Promise = require("q").Promise
mongojs = require "mongojs"
db = mongojs "blog", ["posts"]

exports.getPosts = getPosts = (query, field, sort, skip, limit) ->
  return Promise (resolve, reject) ->
    db.posts
      .find query, field
      .sort sort
      .skip skip
      .limit limit, (err, results) ->
        if err then reject err else resolve results

exports.getCount = getCount = (query, sort, skip, limit) ->
  return getPosts query, _id:1, sort, skip, limit
    .then (data) ->
      return data.length

exports.getCategories = getCategories =() ->
  return new Promise (resolve, reject) ->
    db.posts.aggregate [
        $project: categories: 1
      ,
        $unwind: "$categories"
      ,
        $group:
          _id: "$categories"
          count: "$sum": 1
      ,
        $sort: count: -1
    ], (err, results) ->
      if err then reject err else resolve results
