var request = require('request')
var SlackBot = require('slackbots');
const lastPath = '/tmp/last.txt'
const fs = require('fs')

const http = require('https')

var cookieJar = request.jar();

var config = undefined

const get = url => {

  return new Promise((resolve, reject) => {

    request({jar: cookieJar, url}, function (error, response, body) {
      if (error) reject(error)
      resolve(body)
    })

  })
}


function doDiffModules(before, now) {
  
  const filtered =
    now.filter((e) => before.find((elem) => elem.title === e.title) === undefined)
  return filtered.map((e) => e.title)
}

const detectNotif = (bot, json) => {

  console.log(json)
  if (json.board.length === 0) {
    return bot.say("general", "L'intra a renvoyé une erreur: " + JSON.parse(json, null, 2))
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
      	  bot.notif(`Une nouvelle notification est apparue sur l'intra de ${config['your-name']} ${notifs[0].title}`)
		.then(() => resolve())
          .catch(err => reject(err))
      	}
      if (diffLen > 0) {
          const str = diffLen > 1 ? 'modules ont' : 'module a'
      	  bot.notif(`${diffLen} ${str} ouvert: ${modulesDiff.join('\n')}`)
		.then(() => resolve())
          .catch(err => reject(err))
      	}
      	bot.say('botalive', `Everything\'s good. Notifid: ${notifs[0].id}`)
		.then(() => resolve())
        .catch(err => reject(err))
      })
  })
  })
}

fs.readFile(__dirname + '/config', (err, res) => {
  config = JSON.parse(res)

  // create a bot
  const bot = new SlackBot({
      token: config['bot-token'], // Add a bot https://my.slack.com/services/new/bot and put the token
      name: config['bot-name']
  });
  
  bot.say = (channel, what) => bot.postMessageToChannel(channel, what)

  bot.notif = title => bot.say(config['main-channel'], title)

  get(config['intra-autologin'])
    .catch(err => console.log("Got error: " + err.message))
    .then(() => get('https://intra.epitech.eu/?format=json'))
    .then(json => detectNotif(bot, JSON.parse(json)))
    .catch(err => console.error(err))
})
