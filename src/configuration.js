import {
  DATA_CHANNEL_NAME,
  DATA_FIELD_CHANNEL_RECEIVER_ID,
  DATA_HEADER_MAIN_PROPERTIES,
} from './constants.js'
import properties from './properties-parser.js'
import { VL_DATA_MAIN_PROPERTIES } from './validate-data.js'

/**
 *
 * @param {import('discord.js').Guild} guild
 */
const createChannelData = async (guild) => {
  return guild.channels.create(DATA_CHANNEL_NAME, {
    type: 'text',
  })
}

/**
 *
 * @param {import('discord.js').Client} client
 * @param {import('discord.js').Message} message
 */
export const configureChannelData = async (message) => {
  await message.channel.send('Start configuration...')

  const guild = message.guild
  const channels = guild.channels.cache
  const clientUser = guild.me
  const everyoneRole = guild.roles.everyone

  /** @type {import('discord.js').TextChannel} */
  let dataChannel = channels.find(
    (channel) => channel.type === 'text' && channel.name === DATA_CHANNEL_NAME,
  )
  if (!dataChannel) {
    dataChannel = await createChannelData(guild)
  }

  await dataChannel.overwritePermissions([
    {
      id: clientUser.id,
      allow: [
        'VIEW_CHANNEL',
        'MANAGE_CHANNELS',
        'SEND_MESSAGES',
        'MANAGE_MESSAGES',
      ],
    },
    {
      id: everyoneRole.id,
      deny: [
        'VIEW_CHANNEL',
        'MANAGE_CHANNELS',
        'SEND_MESSAGES',
        'MANAGE_MESSAGES',
      ],
    },
  ])

  await message.channel.send('Configuring Data Channel...')
  const msgList = await dataChannel.messages.fetch()
  /** @type {import('discord.js').Message} */
  const rootData = msgList.find((msg) => {
    const t = VL_DATA_MAIN_PROPERTIES.test(msg.content)
    console.log(msg.content)
    return t
  })

  const props = properties.parseToObject((rootData && rootData.content) || '')
  props[DATA_FIELD_CHANNEL_RECEIVER_ID] = message.channel.id
  const textProps =
    DATA_HEADER_MAIN_PROPERTIES + properties.parseToString(props)
  if (rootData) {
    try {
      await rootData.edit(textProps)
    } catch (err) {
      await rootData.delete()
      await dataChannel.send(textProps)
    }
  } else {
    await dataChannel.send(textProps)
  }
  await message.channel.send('All right now! 👌')
}
