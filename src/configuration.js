import {
  DATA_CHANNEL_NAME,
  DATA_FIELD_CHANNEL_MAIN_PROPERTIES_ID,
  DATA_FIELD_CHANNEL_RECEIVER_ID,
  DATA_HEADER_MAIN_PROPERTIES,
} from './constants.js'
import {
  MESSAGE_CREATE_MEMORY_CHANNEL,
  MESSAGE_END_CONFIGURE,
  MESSAGE_NOT_CONFIGURED_YET,
  MESSAGE_PROTECT_MEMORY,
  MESSAGE_START_CONFIGURE,
} from './messages.js'
import PropertiesParser from './properties-parser.js'
import { VL_DATA_MAIN_PROPERTIES } from './validate-data.js'

/**
 *
 * @param {import('discord.js').Guild} guild
 */
const createChannelData = async (guild) => {
  const channel = await guild.channels.create(DATA_CHANNEL_NAME, {
    type: 'text',
  })

  channel.send(MESSAGE_PROTECT_MEMORY)

  return channel
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
  const rootData = msgList.find((msg) =>
    VL_DATA_MAIN_PROPERTIES.test(msg.content),
  )

  return rootData
}

/**
 *
 * @param {PropertiesParser} props
 * @param {import('discord.js').Channel} channel
 */
const setMainPropertiesMessage = async (props, channel) => {
  if (!channel) return Promise.reject(MESSAGE_NOT_CONFIGURED_YET)
  if (props.message) {
    try {
      await props.storeData()
    } catch (err) {
      await message.delete()
      await channel.send(textProps)
      const textProps = props.toString()
      await channel.send(textProps)
    }
  } else {
    const textProps = props.toString()
    await channel.send(textProps)
  }
}

/**
 *
 * @param {import('discord.js').Message} message
 */
export const getRootDataProps = async (message) => {
  const dataChannel = await tryGetDataChannel(message)
  const rootMessage = await tryGetMainPropertiesMessage(dataChannel)

  const props = new PropertiesParser(rootMessage)
  return props
}

/**
 *
 * @param {import('discord.js').Message} message
 */
export const configureChannelData = async (message) => {
  await message.reply(MESSAGE_START_CONFIGURE)

  const guild = message.guild
  const clientUser = guild.me
  const everyoneRole = guild.roles.everyone

  /** @type {import('discord.js').TextChannel} */
  let dataChannel = await tryGetDataChannel(message)
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

  await message.reply(MESSAGE_CREATE_MEMORY_CHANNEL)
  const rootData = await tryGetMainPropertiesMessage(dataChannel)

  const props = new PropertiesParser(rootData)
  props.setHeader(DATA_HEADER_MAIN_PROPERTIES)
  props.setComment(
    DATA_FIELD_CHANNEL_RECEIVER_ID,
    `Receiver commands channel id (last channel name: '${message.channel.name}')`,
  )
  props.setValue(DATA_FIELD_CHANNEL_RECEIVER_ID, message.channel.id)
  props.setValue(DATA_FIELD_CHANNEL_MAIN_PROPERTIES_ID, dataChannel.id)
  await setMainPropertiesMessage(props, dataChannel)
  await message.reply(MESSAGE_END_CONFIGURE)
}
