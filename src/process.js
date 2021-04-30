import Chance from 'chance'
import minimist from 'minimist'
import { createUserDataMessage, tryUserDataMessage } from './configuration.js'
import {
  MESSAGE_CRITICAL_ROLLING,
  MESSAGE_FAIL_ROLLING,
  MESSAGE_LARGE_ROLLING,
  MESSAGE_MANY_ROLLINGS,
  MESSAGE_USER_NOT_MEMO,
  MESSAGE_VAR_NOTFOUND,
} from './messages.js'
import PropertiesParser from './properties-parser.js'
import {
  VL_COMMAND_GET_VAR,
  VL_COMMAND_LIST_VARS,
  VL_COMMAND_ROLLING,
} from './validate-command.js'

/**
 *
 * @param {import('discord.js').Message} message
 * @param {any} rolling
 */
const replyRollingValue = (
  message,
  { value, large = false, critical = false, fail = false },
) => {
  let text = value
  switch (true) {
    case critical:
      text += MESSAGE_CRITICAL_ROLLING
      break
    case fail:
      text += MESSAGE_FAIL_ROLLING
      break
    case large:
      text += MESSAGE_LARGE_ROLLING
      break
  }

  message.reply(text)
}

/**
 *
 * @param {string} cmd
 * @param {Chance} chance
 */
const rollingCommand = (cmd, chance) => {
  const flags = {
    large: false,
    critical: false,
    fail: false,
  }

  cmd = cmd.toLowerCase().replace(/\s+/g, '')
  const dices = cmd.match(/(\d+d\d+)/g).map((d) => {
    const data = {
      name: d,
    }
    data.values = chance.rpg(data.name).sort((a, b) => b - a)
    flags.fail = flags.fail || !!data.values.includes(1)
    flags.critical =
      flags.critical || !!data.values.includes(parseInt(d.split('d')[1]))
    flags.large = flags.large || !!data.values.length > 10
    data.total = data.values.reduce((p, v) => (p || 0) + v)
    return data
  })

  const cmdWithValues = cmd.replace(/(\d+d\d+)/g, (v) => {
    const dice = dices.find((d) => d.name === v)
    return dice.total
  })
  const sum = cmdWithValues
    .match(/((\+|\-)?\d+)/g)
    .reduce((p, v) => (p || 0) + parseInt(v))
  const cmdToPrint = cmd
    .replace(/(\d+d\d+)/g, (v) => {
      const dice = dices.find((d) => d.name === v)
      return `[${dice.values.join(', ')}]${v}`
    })
    .replace(/(\+|\-)/g, (v) => ` ${v} `)

  return {
    ...flags,
    value: `\`${sum}\` = ` + cmdToPrint,
  }
}

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
  vars.loadData()
  const chance = new Chance()
  const args = message.content.split(/\s+/g).slice(1)
  const parsed = minimist(args)
  const noVarCommands = parsed._ || []
  delete parsed._
  delete parsed['--']
  const commands = Object.entries(parsed)
  commands.push(...noVarCommands)
  let count = 0

  const replyValue = (rolling) => {
    count++
    replyRollingValue(message, rolling)
  }

  commands.forEach((cmd) => {
    if (Array.isArray(cmd) && cmd.length === 2) {
      if (!VL_COMMAND_ROLLING.test(cmd[1])) return
      const rolling = rollingCommand(cmd[1], chance)
      vars.setValue(cmd[0], JSON.parse(JSON.stringify(rolling)))
      rolling.value = `**${cmd[0]}:** ` + rolling.value
      replyValue(rolling)
    }
    if (typeof cmd === 'string') {
      if (!VL_COMMAND_ROLLING.test(cmd)) return
      const rolling = rollingCommand(cmd, chance)
      replyValue(rolling)
    }
  })

  await vars.storeData()
  if (count > 4) message.replay(MESSAGE_MANY_ROLLINGS)
}

/**
 *
 * @param {import('discord.js').Message} message
 */
const listCommand = async (message) => {
  const dataMessage = await tryUserDataMessage(message, message.author.id)
  if (!dataMessage) return message.reply(MESSAGE_USER_NOT_MEMO)
  const vars = new PropertiesParser(dataMessage)
  vars.loadData()

  const varsList = Object.entries(vars.data)
  if (!varsList.length) {
    return message.reply(MESSAGE_USER_NOT_MEMO)
  }

  message.reply(
    `Here is this master, your rollings 🎉\n\n` +
      varsList
        .map(([key, d]) => {
          const comment = d.comment
          const value = d.value.value || d.value

          return (comment ? comment + '\n' : '') + (`**${key}:** ` + value)
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
  vars.loadData()

  const varId = message.content.split(/\s+/)[2]
  const comment = vars.getComment(varId)
  const value = vars.getValue(varId)
  if (value) {
    message.reply(
      `Here is this master! Your rolling 🎉\n\n` +
        (comment ? comment + '\n' : '') +
        (varId + ': ' + value),
    )
  } else {
    message.reply(MESSAGE_VAR_NOTFOUND)
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
    default:
      return rollingCommands(message)
  }
}
