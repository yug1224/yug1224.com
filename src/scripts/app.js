window.jQuery = window.$ = require('jquery');
require('bootstrap');
const hljs = require('highlight.js');
const request = require('request');

$(() => {
  hljs.initHighlightingOnLoad();
  return;
});

$('#upsert').click(function() {
  const _id = $('#_id').val();
  const datetime = $('#datetime').val();
  const categories = $('#categories').val();
  const title = $('#title').val();
  const body = $('#body').val();
  const image = $('#image').val();

  const opt = {
    form: {
      date: datetime ? new Date(datetime) : new Date(),
      categories: categories,
      title: title,
      body : body,
      image: image ? image : null
    }
  };

  if (_id) {
    opt.url = `${location.origin}/archives/${_id}`;
    opt.method = 'PUT';
  } else {
    opt.url = `${location.origin}/archives`;
    opt.method = 'POST';
  }

  request(opt, (err, response, body) => {
    location.href = '/archives';
  });
  return;
});

$('#destroy').click(function() {
  const _id = $('#_id').val();
  const opt = {
    url: `${location.origin}/archives/${_id}`,
    method: 'DELETE'
  };
  request(opt, (err, response, body) => {
    location.href = '/archives';
  });
});
