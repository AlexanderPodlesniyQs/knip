import fs from 'node:fs';
import { EOL } from 'node:os';
// biome-ignore lint/nursery/noRestrictedImports: script
import path from 'node:path';

const cc = str => str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_m, char) => char.toUpperCase());

const pluginsDir = path.resolve('src/plugins');
const outputFileTypes = path.resolve('src/types/PluginNames.ts');
const outputFilePlugins = path.resolve('src/plugins/index.ts');

const pluginNames = fs
  .readdirSync(pluginsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('_'))
  .map(dirent => dirent.name)
  .sort();

const typeDefinition = `export type PluginName = ${pluginNames.map(name => `'${name}'`).join(' | ')};`;

const values = `export const pluginNames = [${pluginNames.map(name => `'${name}'`).join(',')}] as const;`;

fs.writeFileSync(outputFileTypes, typeDefinition + EOL + EOL + values);

const imports = pluginNames.map(name => `import { default as ${cc(name)} } from './${name}/index.js';`).join(EOL);
const pluginsObj = `export const Plugins = {${pluginNames
  .map(name => (name === cc(name) ? `${name},` : `'${name}': ${cc(name)},`))
  .join(EOL)} };`;

fs.writeFileSync(outputFilePlugins, imports + EOL + EOL + pluginsObj);
