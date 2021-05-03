export const VL_COMMAND_INITIALIZE_SERVER = /^\$md (config|cfg)$/
export const VL_COMMAND_LIST_VARS = /^\$md (list|ls)$/
export const VL_COMMAND_GET_VAR = /^\$md get [a-zA-Z]+$/
export const VL_COMMAND_ROLLING = /^(((\d{1,3}d\d{1,4}|\d{1,4})\s*(\+|\-)\s*)*(\d{1,3}d\d{1,4})(\s*(\+|\-)\s*(\d{1,3}d\d{1,4}|\d{1,4}))*)$/i
