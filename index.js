const express = require('express');
const fetch = require('node-fetch');
const emoji = require('node-emoji');
const moment = require('moment');

const app = express();
const port = 8080;

const env = require('dotenv').config();
const NEWS_API_KEY = process.env.NEWS_API_KEY;

let totalPages;
const maxPages = 100;
const pageSize = 20;
const baseUrl = 'http://newsapi.org/v2/everything'
const baseUrlMain = 'https://newsapi.org/v2/top-headlines';

const path = require('path');
const root = path.join(__dirname, 'public');
app.use(express.static(root));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// middleware for all requests
app.use((req, res, next) => {
   res.locals.query = req.query;
   res.locals.params = req.params;
   console.log('Log:', Date.now());
   next();
});

const goHome = async (req, res) => {
  let page = req.query.page ? req.query.page : 1;
  let url = `${baseUrlMain}?country=in&pageSize=${pageSize}&page=${page}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
  let response = await fetch(url) 
  let result = await response.json();
  totalPages = result.totalResults < maxPages ? result.totalResults : maxPages;
  res.locals.news = {
    articles: result.articles,
    totalPages,
    pageSize,
    emoji
  }
  res.render('layout.ejs', { title: 'Home', content:'index.ejs' });
}

const goToNews = async (req, res) => {
  //let date = moment(new Date).format('YYYY-MM-DD')
  let page = req.query.page, topics = req.query.topic;
  let urlEvery = `${baseUrl}?q=${topics}&pageSize=${pageSize}&page=${page}&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
  let response = await fetch(urlEvery) 
  let result = await response.json();
  totalPages = result.totalResults < maxPages ? result.totalResults : maxPages;
  res.locals.news = {
    articles: result.articles,
    totalPages,
    pageSize,
    emoji,
    topics
  }
  res.render('layout.ejs', { title: 'News', content:'news.ejs' });
}

const goHomePublic = (req, res) => {
  res.sendFile('home.html', {root}, (err) => {
    if (err) res.send(err);
  });
}

// all routes
app.get('/', goHome);
app.get('/news', goToNews);
app.get('/home-public', goHome);

app.listen(port, () => {
  //console.log('Listening on port', port);
});