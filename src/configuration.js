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
 * @param {import('discord.js').Message} message
 */
const tryGetDataChannel = async (message) => {
  const guild = message.guild
  const channels = guild.channels.cache
  /** @type {import('discord.js').TextChannel} */
  const dataChannel = channels.find(
    (channel) => channel.type === 'text' && channel.name === DATA_CHANNEL_NAME,
  )

  return dataChannel
}

/**
 *
 * @param {import('discord.js').Channel} channel
 */
const tryGetMainPropertiesMessage = async (channel) => {
  if (!channel) return null
  const msgList = await channel.messages.fetch()
  /** @type {import('discord.js').Message} */
  const rootData = msgList.find((msg) => {
    const t = VL_DATA_MAIN_PROPERTIES.test(msg.content)
    console.log(msg.content)
    return t
  })

  return rootData
}

/**
 *
 * @param {import('discord.js').Channel} channel
 */
const setMainPropertiesMessage = async (props, channel) => {
  if (!channel) return Promise.reject('The MemoDice is not configured!')
  const message = tryGetMainPropertiesMessage(channel)
  const textProps =
    DATA_HEADER_MAIN_PROPERTIES + properties.parseToString(props)
  if (message) {
    try {
      await message.edit(textProps)
    } catch (err) {
      await message.delete()
      await channel.send(textProps)
    }
  } else {
    await channel.send(textProps)
  }
}

/**
 *
 * @param {import('discord.js').Message} message
 */
export const setRootDataProps = async (props, message) => {
  const dataChannel = tryGetDataChannel(message)
  await setMainPropertiesMessage(props, dataChannel)
}

/**
 *
 * @param {import('discord.js').Message} message
 */
export const getRootDataProps = async (message) => {
  const dataChannel = tryGetDataChannel(message)
  const rootMessage = tryGetMainPropertiesMessage(dataChannel)

  const props = properties.parseToObject(
    (rootMessage && rootMessage.content) || '',
  )

  return props
}

/**
 *
 * @param {import('discord.js').Message} message
 */
export const configureChannelData = async (message) => {
  await message.channel.send('Start configuration...')

  const guild = message.guild
  const clientUser = guild.me
  const everyoneRole = guild.roles.everyone

  /** @type {import('discord.js').TextChannel} */
  let dataChannel = tryGetDataChannel(message)
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
  const rootData = tryGetMainPropertiesMessage(dataChannel)

  const props = properties.parseToObject((rootData && rootData.content) || '')
  props[DATA_FIELD_CHANNEL_RECEIVER_ID] = message.channel.id
  await setMainPropertiesMessage(props, dataChannel)
  await message.channel.send('All right now! 👌')
}
