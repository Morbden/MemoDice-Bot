import minimist from 'minimist'

/**
 *
 * @param {import('discord.js').Message} message
 */
export const processCommand = async (message) => {
  const args = message.content.split(/\s+/g).slice(1)
  const commands = minimist(args)
  message.reply(JSON.stringify(commands))
}
