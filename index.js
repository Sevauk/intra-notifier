var request = require('request')
var SlackBot = require('slackbots');
const fs = require('fs')



var jsdom = require("jsdom").jsdom;
var doc = jsdom();
var window = doc.defaultView;

const $ = require('jquery')(window)

const http = require('https')

var cookieJar = request.jar();

let cheerio = require('cheerio')

const get = url => {

  return new Promise((resolve, reject) => {

    request({jar: cookieJar, url}, function (error, response, body) {
      if (error) reject(error)
      resolve(body)
    })

  })
}

const notif = title => {

  // create a bot
  var bot = new SlackBot({
      token: 'xoxb-36845936224-Hmcsn5wmrGZV7z8UxkBvkM26', // Add a bot https://my.slack.com/services/new/bot and put the token
  });

/*
  bot.on('start', function() {
      // more information about additional params https://api.slack.com/methods/chat.postMessage
      var params = {
      };

      // define channel, where bot exist. You can adjust it there https://my.slack.com/services
      bot.postMessageToChannel('general', 'meow!', params);
  })
  */
}

const detectNotif = json => {
  fs.readFile('last.txt', (err, res) => {
    const id = res.toString()
    const newId = json[0].id

    notif(json[0].title)

    if (id === newId) {
      console.log('no update')
      return
    }

    fs.writeFile('last.txt', newId)
  })
}

get('https://intra.epitech.eu/auth-2991948b7e99b1d6482ce93f803b44d17ef73822')
  .catch(err => console.log("Got error: " + err.message))
  .then(() => get('https://intra.epitech.eu/user/notification/message?format=json'))
  .then(json => detectNotif(JSON.parse(json)))
