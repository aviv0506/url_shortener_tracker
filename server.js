const express = require('express')
const mongoose = require('mongoose')
const useragent = require('express-useragent');

const ShortUrl = require('./models/shortUrl')
const Entries = require('./models/entries')

const app = express()

mongoose.connect('mongodb://localhost/urlShortener', {
  useNewUrlParser: true, useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
  const shortUrls = await ShortUrl.find()
  res.render('index', { shortUrls: shortUrls })
})

app.post('/shortUrls', async (req, res) => {
  await ShortUrl.create({ full: req.body.fullUrl })
  res.redirect('/')
})

app.post('/moredetails', async (req, res) => {
  const shortUrls = await ShortUrl.find()
  var shorturls = 'shorturls'
  shortlink = req.body.shortUrl
  var userEntries = function (shortlink, callback) {
    Entries.find().where("short", shortlink).
      exec(function (err, userEntry) {
        userEntry.reverse();
        callback(err, userEntry);
      });
  };

  userEntries(req.body.shortUrl, function (err, userEntry) {
    if (err) {
      return;
    }
    res.render('moredetails', { shortUrls: userEntry });
  });
})

app.get('/:shortUrl', async (req, res) => {
  const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
  if (shortUrl == null) return res.sendStatus(404)

  shortUrl.clicks++

  // ip
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  if (ip.substr(0, 7) == "::ffff:") {
    ipAddr = ip.substr(7)
  }

  // user agent 
  module.exports = {
    getUserAgent: function (req, res) {
      return res.json({
        userAgent: req.headers['user-agent']
      });
    }
  }

  // source port
  const sourcePort = res.socket.remotePort;
  res.redirect(shortUrl.full)
  await Entries.create({ ip: ip, userAgent: req.headers['user-agent'], short: shortUrl.short })
  shortUrl.save()
})

app.listen(process.env.PORT || 3000);