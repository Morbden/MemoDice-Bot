export const VL_DATA_MAIN_PROPERTIES = /^##MAIN_PROPERTIES##/
export const VL_DATA_USER_PROPERTIES = (uid) =>
  new RegExp(`^##USER_PROPERTIES_${uid}##`)
