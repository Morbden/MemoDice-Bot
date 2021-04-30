import 'colors'
import { Client } from 'discord.js'
import { configureChannelData } from './configuration.js'
import { VL_COMMAND_INITIALIZE_SERVER } from './validate-command.js'

const BOT_TOKEN = process.env.BOT_TOKEN

const client = new Client()

client.on('ready', () => {
  console.log('Start bot... 🤖')
  client.user.setStatus('online')
})

client.on('message', (msg) => {
  if (msg.author.bot) return
  if (VL_COMMAND_INITIALIZE_SERVER.test(msg.content)) {
    return configureChannelData(msg).catch((err) => {
      console.log(err.message || err)
      msg.channel.send('Something unexpected error happens')
    })
  }
  //  console.log(msg.channel)
  // console.log(msg.content)
})

client.login(BOT_TOKEN)
