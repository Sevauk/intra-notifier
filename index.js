var request = require('request')
var SlackBot = require('slackbots');
const lastPath = '/tmp/last.txt'
const fs = require('fs')

const http = require('https')

var cookieJar = request.jar();

const get = url => {

  return new Promise((resolve, reject) => {

    request({jar: cookieJar, url}, function (error, response, body) {
      if (error) reject(error)
      resolve(body)
    })

  })
}

// create a bot
var bot = new SlackBot({
    token: 'xoxb', // Add a bot https://my.slack.com/services/new/bot and put the token
    name: 'jarvis'
});

const say = (channel, what) => bot.postMessageToChannel(channel, what)

const notif = title =>
  say('urgence', title)
    .then(() => process.exit())



const detectNotif = json => {

  if (json.board.length === 0) {
    return say("general", "J\'ai recontré un problème d'authentification")
  }

  return new Promise((resolve, reject) => {

  fs.readFile(lastPath, (err, res) => {

    const moduleslen = json['board']['modules'].length
    const notifs = json['history']

    if (!err) {


      let last = {notifid: 0, moduleslen: 0}

      try {
        last = JSON.parse(res.toString())
      } catch (e) {
      }

      const id = last.notifid
      const newId = notifs[0].id

      if (id !== newId) {
        notif('Une nouvelle notification est apparue sur l\'intra d\'Adrien. ' + notifs[0].title)
      }
      if (last.moduleslen != moduleslen) {
        notif('Des modules ont ouvert (total: ' + moduleslen + ' modules)')
      }
    }

    const fileContent = JSON.stringify({'notifid': notifs[0].id, moduleslen})

    fs.writeFile(lastPath, fileContent, (err) => {
	      if (err) console.log(err)
        resolve()
    })
  })
  })
}


get('https://intra.epitech.eu/auth-82f56bda6f9bde4e26960922e98f6df081bcf4ed')
  .then(() => {
    say('botalive', 'I\'m performing a check')
	.catch(err => console.log(err))
  })
  .catch(err => console.log("Got error: " + err.message))
  .then(() => get('https://intra.epitech.eu/?format=json'))
  .then(json => detectNotif(JSON.parse(json)))
  .then(process.exit)
