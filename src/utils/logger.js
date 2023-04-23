import signale from 'signale';
const { LOG_LEVEL = 'info' } = process.env;

const options = {
  logLevel: LOG_LEVEL,
  scope: 'HookShare',
};

export const logger = new signale.Signale(options);
