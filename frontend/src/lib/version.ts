// Version is read from package.json at build time
import packageJson from '../../package.json';

export const APP_VERSION = packageJson.version;
export const APP_NAME = 'LDC Tools';
