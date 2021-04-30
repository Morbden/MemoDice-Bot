import minimist from 'minimist'
import PropertiesParser from './properties-parser.js'

/**
 *
 * @param {import('discord.js').Message} message
 * @param {PropertiesParser} props
 */
export const processCommand = async (message, props) => {
  const args = message.content.split(/\s+/g).slice(1)
  const commands = minimist(args)
  message.reply(JSON.stringify(commands))
}
