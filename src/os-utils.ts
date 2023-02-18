import os from 'os';
import fs from 'fs';

const readOsReleaseFile = (): { [key: string]: string} => {
  const content = fs.readFileSync('/etc/os-release', 'utf8');
  const lines = content.split('\n');

  const info = {};

  lines.forEach((line) => {
    if (line) {
      const [property, value] = line.split('=');
      info[property] = value.replace(/^"(.*)"$/, '$1');
    }
  });

  return info;
};
function getLinuxDescription(): string {
  const info = readOsReleaseFile();
  return `${info.NAME} ${info.VERSION_ID}`;
}

/**
 * Returns System description,
 * e.g.:
 * - Linux Mint 21
 * - Linux Ubuntu 22.1
 * - Windows 11
 */
const getSystemDescription = (): string => {
  const systemName = os.type();
  const systemVersion = os.version();
  const systemArch = os.arch();

  if (os.type() === 'Linux') {
    return getLinuxDescription();
  }

  return `${systemName} ${systemVersion} ${systemArch}`;
};

export default getSystemDescription;
