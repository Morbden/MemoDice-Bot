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
    const lines = this.message.content.replace(/\r*/g, '').split(/\n+/g)
    this.header = lines.shift()
    this.data = {}

    let lastComments = ''
    lines.forEach((line) => {
      if (line[0] === '#') {
        if (!lastComments) lastComments = line
        else lastComments += '\n' + line
        return
      }

      const entry = line.split(/=/)
      if (entry.length >= 2) {
        const key = entry.shift().trim()
        const text = entry.join('=').trim()

        this.data[key] = {
          comment: lastComments,
          value: JSON.parse(text),
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
      if (!this.data[key]) continue
      lines.push(this.data[key].comment)
      lines.push(key + '=' + JSON.stringify(this.data[key].value))
    }

    return lines.join('\n')
  }

  setComment(key, comment) {
    if (this.data[key]) this.data[key].comment = '#' + comment
    else this.data[key] = { comment: '#' + comment, value: null }
  }

  setValue(key, value) {
    if (this.data[key]) this.data[key].value = value
    else this.data[key] = { comment: '', value }
  }

  getComment(key, fallback = null) {
    return (
      (this.data[key] &&
        this.data[key].comment &&
        this.data[key].comment.slice(1)) ||
      fallback
    )
  }

  getValue(key, fallback = null) {
    return (this.data[key] && this.data[key].value) || fallback
  }

  setHeader(text) {
    this.header = text
  }
}
