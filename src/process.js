import minimist from 'minimist'
import PropertiesParser from './properties-parser.js'
import { tryUserDataMessage } from './configuration.js'
import { MESSAGE_USER_NOT_MEMO } from './messages.js'
import {
  VL_COMMAND_GET_VAR,
  VL_COMMAND_LIST_VARS,
  VL_COMMAND_ROLLING,
} from './validate-command.js'

const DICE = /(\d+d\d+)/i

/**
 *
 * @param {import('discord.js').Message} message
 */
const rollingCommands = async (message) => {
  const dataMessage = await tryUserDataMessage(message, message.author.id)
  /** @type {PropertiesParser} props */
  let vars
  if (dataMessage) {
    vars = new PropertiesParser(dataMessage)
  } else {
    const baseMessage = await createUserDataMessage(message, message.author.id)
    vars = new PropertiesParser(baseMessage)
  }

  const args = message.content.split(/\s+/g).slice(1)
  const parsed = minimist(args)
  const noVarCommands = parsed._ || []
  delete parsed._
  delete parsed['--']
  const commands = Object.entries(parsed)
  commands.push(...noVarCommands)

  console.log(commands)
}

/**
 *
 * @param {import('discord.js').Message} message
 */
const listCommand = async (message) => {
  const dataMessage = await tryUserDataMessage(message, message.author.id)
  if (!dataMessage) return message.reply(MESSAGE_USER_NOT_MEMO)
  const vars = new PropertiesParser(dataMessage)

  message.reply(
    `Here is this master, your rollings 🎉\n\n` +
      Object.entries(vars.data)
        .map(([key, d]) => {
          const comment = d.comment
          const value = d.value

          return (comment ? comment + '\n' : '') + (key + ': ' + value)
        })
        .join('\n'),
  )
}

/**
 *
 * @param {import('discord.js').Message} message
 */
const getCommand = async (message) => {
  const dataMessage = await tryUserDataMessage(message, message.author.id)
  if (!dataMessage) return message.reply(MESSAGE_USER_NOT_MEMO)
  const vars = new PropertiesParser(dataMessage)
  const varId = message.content.split('s+')[2]
  const comment = vars.getComment(varId)
  const value = vars.getValue(varId)
  if (value) {
    message.reply(
      `Here is this master! Your rolling 🎉\n\n` +
        (comment ? comment + '\n' : '') +
        (varId + ': ' + value),
    )
  } else {
    message.reply(`I\'m sorry master 😥. I didn\'t find that scroll.`)
  }
}

/**
 *
 * @param {import('discord.js').Message} message
 * @param {PropertiesParser} props
 */
export const processCommand = async (message, props) => {
  switch (true) {
    case VL_COMMAND_LIST_VARS.test(message.content):
      return listCommand(message)
    case VL_COMMAND_GET_VAR.test(message.content):
      return getCommand(message)
    case VL_COMMAND_ROLLING.test(message.content):
      return rollingCommands(message)
  }
}
