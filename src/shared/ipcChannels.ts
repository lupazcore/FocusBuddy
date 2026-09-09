export const IPC = {
  WIN_MINIMIZE: 'window:minimize',
  WIN_MAXIMIZE: 'window:maximize',
  WIN_CLOSE: 'window:close',
  WIN_IS_MAXIMIZED: 'window:isMaximized',

  APP_GET_VERSION: 'app:getVersion',
  APP_GET_PLATFORM: 'app:getPlatform',

  STORE_GET_SETTINGS: 'store:getSettings',
  STORE_SET_SETTINGS: 'store:setSettings',
  STORE_GET_PRESETS: 'store:getPresets',
  STORE_SET_PRESETS: 'store:setPresets',
  STORE_GET_RITUALS: 'store:getRituals',
  STORE_SET_RITUALS: 'store:setRituals',
  STORE_GET_STATS: 'store:getStats',
  STORE_SET_STATS: 'store:setStats',
  STORE_GET_MIX: 'store:getMix',
  STORE_SET_MIX: 'store:setMix',

  DIALOG_PICK_AUDIO_FILES: 'dialog:pickAudioFiles',

  SOUND_IMPORT_CUSTOM: 'sound:importCustom',
  SOUND_GET_CUSTOM_LIST: 'sound:getCustomList',
  SOUND_REMOVE_CUSTOM: 'sound:removeCustom',

  NOTIFICATION_SHOW: 'notification:show',

  AUTOSTART_SET: 'autostart:set',

  SHORTCUT_SET: 'shortcut:set',
  SHORTCUT_TRIGGERED_EVENT: 'shortcut:triggered',

  UPDATE_CHECK: 'update:check',
  UPDATE_STATUS_EVENT: 'update:status',

  MINIPLAYER_OPEN: 'miniplayer:open',
  MINIPLAYER_PUSH_STATE: 'miniplayer:pushState',
  MINIPLAYER_STATE_EVENT: 'miniplayer:state',
  MINIPLAYER_COMMAND: 'miniplayer:command',
  MINIPLAYER_COMMAND_EVENT: 'miniplayer:commandReceived',

  MEDIA_KEY_EVENT: 'media:key',

  SESSION_SET_ACTIVE: 'session:setActive',
} as const;
