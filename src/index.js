import 'colors'
import { Client } from 'discord.js'
import Express from 'express'
import cors from 'cors'

import { configureChannelData, getRootDataProps } from './configuration.js'
import { DATA_FIELD_CHANNEL_RECEIVER_ID } from './constants.js'
import { processCommand } from './process.js'
import { VL_COMMAND_INITIALIZE_SERVER } from './validate-command.js'
import { MESSAGE_UNEXPECTED_ERROR } from './messages.js'

const BOT_TOKEN = process.env.BOT_TOKEN
const PORT = parseInt(process.env.PORT) || 3001

const client = new Client()
const app = Express()

// START DISCORD BOT CLIENT CONFIGURE

client.on('ready', () => {
  console.log('Start bot... 🤖')
  client.user.setStatus('online')
})

client.on('message', (message) => {
  if (message.author.bot) return
  if (message.type !== 'DEFAULT' || !message.content.startsWith('$md ')) return

  if (VL_COMMAND_INITIALIZE_SERVER.test(message.content)) {
    return configureChannelData(message).catch((err) => {
      console.log(err)
      message.reply(typeof err === 'string' ? err : MESSAGE_UNEXPECTED_ERROR)
    })
  }

  getRootDataProps(message)
    .then((props) => {
      const receiverId = props.getValue(DATA_FIELD_CHANNEL_RECEIVER_ID)
      if (receiverId !== message.channel.id) return

      return processCommand(message, props)
    })
    .catch((err) => {
      console.log(err)
      message.reply(typeof err === 'string' ? err : MESSAGE_UNEXPECTED_ERROR)
    })
})

// END DISCORD BOT CLIENT CONFIGURE
// START EXPRESS CONFIGURE

app.use(cors())
app.use(Express.json())
app.use(Express.urlencoded({ extended: false }))

app.get('/connect', (_, res) => {
  res.redirect(process.env.URL_INV)
})
app.get('/', (_, res) => {
  res.end('MemoDice Discord Bot')
})

// END EXPRESS CONFIGURE

client.login(BOT_TOKEN)
app.listen(PORT)
