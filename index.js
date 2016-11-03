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
    token: '', // Add a bot https://my.slack.com/services/new/bot and put the token
    name: 'jarvis'
});

const say = (channel, what) => bot.postMessageToChannel(channel, what)

const notif = title =>
  say('urgence', title)

function doDiffModules(before, now) {
  
  const filtered =
    now.filter((e) => before.find((elem) => elem.title === e.title) === undefined)
  return filtered.map((e) => e.title)
}

const detectNotif = json => {

  if (json.board.length === 0) {
    return say("general", "J\'ai recontré un problème d'authentification")
  }

  return new Promise((resolve, reject) => {

  fs.readFile(lastPath, (err, res) => {


    const modules = json['board']['modules']
    const notifs = json['history']

    let last = {notifid: 0, modules: []}

    if (!err) {
      try {
        last = JSON.parse(res.toString())
      } catch (e) {
      }
    }

      const fileContent = JSON.stringify({'notifid': notifs[0].id, modules}, null, 4)

      fs.writeFile(lastPath, fileContent, (err) => {
          if (err) console.log(err)
      	const id = last.notifid
      	const newId = notifs[0].id

        const modulesDiff = doDiffModules(last.modules, modules)
        const diffLen = modulesDiff.length

      	if (id !== newId) {
      	  notif('Une nouvelle notification est apparue sur l\'intra d\'Adrien. ' + notifs[0].title)
		.then(() => resolve())
      	}
      if (diffLen > 0) {
          const str = diffLen > 1 ? 'modules ont' : 'module a'
      	  notif(`${diffLen} ${str} ouvert: ${modulesDiff.join('\n')}`)
		.then(() => resolve())
      	}
      	say('botalive', `Everything\'s good. Notifid: ${notifs[0].id}. Modules: ${modules}`)
		.then(() => resolve())
      })
  })
  })
}


get('https://intra.epitech.eu/auth-82f56bda6f9bde4e26960922e98f6df081bcf4ed')
  .catch(err => console.log("Got error: " + err.message))
  .then(() => get('https://intra.epitech.eu/?format=json'))
  .then(json => detectNotif(JSON.parse(json)))
