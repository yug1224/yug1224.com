(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var config = {
  port: 7826,
  blog: {
    url: 'https://blog.yug1224.com',
    title: 'YuG1224 blog',
    author: 'YuG1224',
    description: 'プログラミングやカメラや日常のこと。'
  },
  GoogleAnalytics: {
    trackingID: 'UA-43402891-1',
    domain: 'blog.yug1224.com'
  },
  twitter: {
    card: 'summary',
    site: '@YuG1224',
    image: 'https://db.tt/Nfw3zxcJ'
  },
  maxAge: 1 * 1000 * 60 * 60 * 24
};

module.exports = config;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxJQUFNLFNBQVM7QUFDYixRQUFNLElBRE87QUFFYixRQUFNO0FBQ0osU0FBSywwQkFERDtBQUVKLFdBQU8sY0FGSDtBQUdKLFlBQVEsU0FISjtBQUlKLGlCQUFhO0FBSlQsR0FGTztBQVFiLG1CQUFpQjtBQUNmLGdCQUFZLGVBREc7QUFFZixZQUFRO0FBRk8sR0FSSjtBQVliLFdBQVM7QUFDUCxVQUFNLFNBREM7QUFFUCxVQUFNLFVBRkM7QUFHUCxXQUFPO0FBSEEsR0FaSTtBQWlCYixVQUFRLElBQUksSUFBSixHQUFXLEVBQVgsR0FBZ0IsRUFBaEIsR0FBcUI7QUFqQmhCLENBQWY7O0FBb0JBLE9BQU8sT0FBUCxHQUFpQixNQUFqQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBjb25maWcgPSB7XG4gIHBvcnQ6IDc4MjYsXG4gIGJsb2c6IHtcbiAgICB1cmw6ICdodHRwczovL2Jsb2cueXVnMTIyNC5jb20nLFxuICAgIHRpdGxlOiAnWXVHMTIyNCBibG9nJyxcbiAgICBhdXRob3I6ICdZdUcxMjI0JyxcbiAgICBkZXNjcmlwdGlvbjogJ+ODl+ODreOCsOODqeODn+ODs+OCsOOChOOCq+ODoeODqeOChOaXpeW4uOOBruOBk+OBqOOAgidcbiAgfSxcbiAgR29vZ2xlQW5hbHl0aWNzOiB7XG4gICAgdHJhY2tpbmdJRDogJ1VBLTQzNDAyODkxLTEnLFxuICAgIGRvbWFpbjogJ2Jsb2cueXVnMTIyNC5jb20nXG4gIH0sXG4gIHR3aXR0ZXI6IHtcbiAgICBjYXJkOiAnc3VtbWFyeScsXG4gICAgc2l0ZTogJ0BZdUcxMjI0JyxcbiAgICBpbWFnZTogJ2h0dHBzOi8vZGIudHQvTmZ3M3p4Y0onXG4gIH0sXG4gIG1heEFnZTogMSAqIDEwMDAgKiA2MCAqIDYwICogMjRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY29uZmlnO1xuIl19
