const mongojs = require('mongojs');
const ObjectId = mongojs.ObjectId;
const db = mongojs('blog', ['archives', 'apps']);

const setArchives = (query, data) => {
  return new Promise((resolve, reject) => {

    const cb = (err, results) => {
      if (err) reject(err);
      else resolve(results);
    };

    if (query) {
      db.archives.update(query, data, cb);
    } else {
      db.archives.insert(data, cb);
    }
  });
};
exports.setArchives = setArchives;

const removeArchives = (query) => {
  return new Promise((resolve, reject) => {

    const cb = (err, results) => {
      if (err) reject(err);
      else resolve(results);
    };

    db.archives.remove(query, cb);
  });
};
exports.removeArchives = removeArchives;

const getArchives = (query, field, sort, skip, limit) => {
  return new Promise((resolve, reject) => {

    const cb = (err, results) => {
      if (err) reject(err);
      else resolve(results);
    };

    if (query._id) {
      query._id = new ObjectId(query._id);
    }

    db.archives.find(query, field)
      .sort(sort)
      .skip(+skip)
      .limit(+limit, cb);
  });
};
exports.getArchives = getArchives;

const getCount = (query, sort, skip, limit) => {
  return new Promise((resolve, reject) => {

    const cb = (err, results) => {
      if (err) reject(err);
      else resolve(results);
    };

    db.archives.find(query, {_id: 1})
      .sort(sort)
      .skip(+skip)
      .limit(+limit)
      .count(cb);
  });
};
exports.getCount = getCount;

const getNext = (query) => {
  const field = {
    _id: 1,
    title: 1,
    create: 1
  };

  return getArchives(query, field, {}, null, 1).then((docs) => {
    const data = docs[0];

    const query = {
      create: {
        $lt: data.create
      }
    };
    const field = {
      title: 1,
      create: 1
    };
    const sort = {
      create: -1
    };

    return getArchives(query, field, sort, 0, 1);
  });
};
exports.getNext = getNext;

const getPrev = (query) => {
  const field = {
    _id: 1,
    title: 1,
    create: 1
  };

  return getArchives(query, field, {}, null, 1).then((docs) => {
    const data = docs[0];

    const query = {
      create: {
        $gt: data.create
      }
    };
    const field = {
      title: 1,
      create: 1
    };
    const sort = {
      create: 1
    };

    return getArchives(query, field, sort, 0, 1);
  });
};
exports.getPrev = getPrev;

const getCategories = () => {
  return new Promise((resolve, reject) => {
    const operators = [];
    operators.push({ $match: { create: { $lt: new Date() }}});
    operators.push({ $project: { categories: 1 }});
    operators.push({ $unwind: '$categories' });
    operators.push({ $sort: { categories: -1 }});
    operators.push({ $group: { _id: '$categories', count: { $sum: 1 }}});
    operators.push({ $sort: { count: -1 }});
    db.archives.aggregate(operators, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
exports.getCategories = getCategories;

const getApps = () => {
  return new Promise((resolve, reject) => {
    db.apps.find((err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
exports.getApps = getApps;
