var request = require('request')
var SlackBot = require('slackbots');
const fs = require('fs')

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
      token: 'xoxb-36845936224-gAFAStUZYaKbwZzLEqTdCfal', // Add a bot https://my.slack.com/services/new/bot and put the token
      name: 'jarvis'
  });

  bot.on('start', function() {
      // more information about additional params https://api.slack.com/methods/chat.postMessage
      var params = {
      };

      // define channel, where bot exist. You can adjust it there https://my.slack.com/services
      bot.postMessageToChannel('urgence', title, params)
        .then(() => process.exit())
  })
}

const detectNotif = json => {
  fs.readFile('last.txt', (err, res) => {


    const moduleslen = json['board']['modules'].length
    const notifs = json['history']

    if (!err) {

      const last = JSON.parse(res.toString())

      const id = last.notifid
      const newId = notifs[0].id

      if (id !== newId) {
        notif('Une nouvelle notification est apparue sur l\'intra d\'Adrien. ' + notifs[0].title)
      }
      if (last.moduleslen != moduleslen) {
        notif('Des modules ont ouvert (total: ' + moduleslen + ' modules)')
      }
    }

    fs.writeFile('last.txt', JSON.stringify({'notifid': notifs[0].id, moduleslen}))
  })
}

get('https://intra.epitech.eu/auth-2991948b7e99b1d6482ce93f803b44d17ef73822')
  .catch(err => console.log("Got error: " + err.message))
  .then(() => get('https://intra.epitech.eu/?format=json'))
  .then(json => detectNotif(JSON.parse(json)))
