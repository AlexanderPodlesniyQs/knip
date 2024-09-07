import type { IsPluginEnabled, Plugin, ResolveEntryPaths } from '#p/types/plugins.js';
import { join } from '#p/util/path.js';
import { hasDependency } from '#p/util/plugin.js';
import { toProductionEntryPattern } from '#p/util/protocols.js';
import type { NuxtConfig } from './types.js';

const title = 'Nuxt';

const note = `Knip works best with [explicit imports](https://nuxt.com/docs/guide/concepts/auto-imports#explicit-imports).
Nuxt allows to [disable auto-imports](https://nuxt.com/docs/guide/concepts/auto-imports#disabling-auto-imports).`;

const enablers = ['nuxt'];

const isEnabled: IsPluginEnabled = ({ dependencies }) => {
  const isEnabled = hasDependency(dependencies, enablers);

  // TODO Add generic way for plugins to init?
  // biome-ignore lint/suspicious/noExplicitAny: deal with it
  if (isEnabled && !('defineNuxtConfig' in globalThis)) (globalThis as any).defineNuxtConfig = (c: any) => c;

  return isEnabled;
};

const entry = ['nuxt.config.{js,mjs,ts}'];

const production = [
  'app.vue',
  'error.vue',
  'pages/**/*.vue',
  'layouts/default.vue',
  'middleware/**/*.ts',
  'server/api/**/*.ts',
  'server/routes/**/*.ts',
  'server/middleware/**/*.ts',
  'server/plugins/**/*.ts',
];

const resolveEntryPaths: ResolveEntryPaths<NuxtConfig> = async localConfig => {
  const srcDir = localConfig.srcDir ?? '.';

  const patterns = [
    'app.vue',
    'error.vue',
    join(typeof localConfig.dir?.pages === 'string' ? localConfig.dir.pages : 'pages', '**/*.vue'),
    join(typeof localConfig.dir?.layouts === 'string' ? localConfig.dir.layouts : 'layouts', '**/*.vue'),
    join(typeof localConfig.dir?.middleware === 'string' ? localConfig.dir.middleware : 'middleware', '**/*.ts'),
    'server/api/**/*.ts',
    'server/routes/**/*.ts',
    'server/middleware/**/*.ts',
    'server/plugins/**/*.ts',
  ];

  return patterns.map(pattern => toProductionEntryPattern(join(srcDir, pattern)));
};

export default {
  title,
  note,
  enablers,
  isEnabled,
  entry,
  production,
  resolveEntryPaths,
} satisfies Plugin;