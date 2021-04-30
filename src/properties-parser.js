const parseValue = (val) => {
  if (val === 'true') return true
  if (val === 'false') return false
  return parseFloat(val) || parseInt(val) || val
}

export default {
  parseToObject(text) {
    const lines = text.split(/\s+/g)
    const data = {}

    lines.forEach((line) => {
      if (line[0] === '#') return
      const entry = line.split(/\s?=\s?/g)
      if (entry.length === 2) {
        data[entry[0].trim()] = parseValue(entry[1].trim())
      }
    })

    return data
  },
  parseToString(object) {
    const obj = JSON.parse(JSON.stringify(object))
    const lines = []
    for (let key in obj) {
      lines.push(key + '=' + obj[key].toString())
    }

    return lines.join('\n')
  },
}
