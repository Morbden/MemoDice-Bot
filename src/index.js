import 'colors'
import { Client } from 'discord.js'
import Express from 'express'
import cors from 'cors'

import { configureChannelData, getRootDataProps } from './configuration.js'
import { DATA_FIELD_CHANNEL_RECEIVER_ID } from './constants.js'
import { processCommand } from './process.js'
import { VL_COMMAND_INITIALIZE_SERVER } from './validate-command.js'

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
      console.log(err.message || err)
      message.channel.send(
        typeof err === 'string' ? err : 'Something unexpected error happens!',
      )
    })
  }

  console.log('RECEIVE Start')
  getRootDataProps(message)
    .then((props) => {
      console.log('RECEIVE', props)
      const receiverId = props[DATA_FIELD_CHANNEL_RECEIVER_ID].toString()
      if (receiverId !== message.channel.id) return

      return processCommand(message)
    })
    .catch((err) => {
      console.log(err.message || err)
      message.channel.send(
        typeof err === 'string' ? err : 'Something unexpected error happens!',
      )
    })
})
// END DISCORD BOT CLIENT CONFIGURE
// START EXPRESS CONFIGURE

app.use(cors())
app.use(Express.json())
app.use(Express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.end('MemoDice Discord Bot')
})

// END EXPRESS CONFIGURE

client.login(BOT_TOKEN)
app.listen(PORT)
