export default class PropertiesParser {
  /** @type {import('discord.js').Message} */
  message = null
  /** @type {{[key: string]: {value: any, comment: string}}} */
  data = {}
  /** @type {string} */
  header = null

  /**
   *
   * @param {import('discord.js').Message} message
   */
  constructor(message) {
    this.message = message
  }

  loadData() {
    if (!this.message) return
    const lines = this.message.content.split(/\s+/g)
    this.header = lines.shift()
    this.data = {}

    let lastComments = ''
    lines.forEach((line) => {
      if (line[0] === '#') {
        if (!lastComments) lastComments = line
        else lastComments += '\n' + line
        return
      }

      const entry = line.split(/\s?=\s?/g)
      if (entry.length === 2) {
        this.data[entry[0].trim()] = {
          comment: lastComments,
          value: JSON.parse(entry[1].trim()),
        }
        lastComments = ''
      }
    })
  }

  async storeData() {
    if (!this.message) return
    const content = this.toString()
    return this.message.edit(content)
  }

  toString() {
    const lines = [this.header]
    for (let key in this.data) {
      lines.push(this.data[key].comment)
      lines.push(key + '=' + JSON.stringify(this.data[key].value))
    }

    return lines.join('\n')
  }

  setComment(key, comment) {
    if (this.data[key]) this.data[key].comment = '#' + comment
    else this.data[key] = { comment, value: null }
  }

  setValue(key, value) {
    if (this.data[key]) this.data[key].value = value
    else this.data[key] = { comment: '', value }
  }

  getComment(key, fallback = null) {
    return (
      (this.data[key].comment && this.data[key].comment.slice(1)) || fallback
    )
  }

  getValue(key, fallback = null) {
    return this.data[key].value || fallback
  }

  setHeader(text) {
    this.header = text
  }
}
