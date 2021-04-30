import 'colors'
import { Client } from 'discord.js'
import { configureChannelData, getRootDataProps } from './configuration.js'
import { DATA_FIELD_CHANNEL_RECEIVER_ID } from './constants.js'
import { VL_COMMAND_INITIALIZE_SERVER } from './validate-command.js'

const BOT_TOKEN = process.env.BOT_TOKEN

const client = new Client()

client.on('ready', () => {
  console.log('Start bot... 🤖')
  client.user.setStatus('online')
})

client.on('message', (message) => {
  if (message.author.bot) return
  if (message.type !== 'DEFAULT' || !message.content.startsWith('-md')) return

  if (VL_COMMAND_INITIALIZE_SERVER.test(message.content)) {
    return configureChannelData(message).catch((err) => {
      console.log(err.message || err)
      message.channel.send(
        typeof err === 'string' ? err : 'Something unexpected error happens!',
      )
    })
  }

  console.log('RECEIVE Start')
  getRootDataProps(message).then((props) => {
    console.log('RECEIVE', props)
    const receiverId = props[DATA_FIELD_CHANNEL_RECEIVER_ID].toString()
    if (receiverId !== message.channel.id) return

    message.channel.send("I'm listening in here!")
  })
})

client.login(BOT_TOKEN)
