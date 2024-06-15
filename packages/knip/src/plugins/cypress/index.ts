import type { IsPluginEnabled, Plugin, ResolveEntryPaths } from '#p/types/plugins.js';
import { hasDependency } from '#p/util/plugin.js';
import { toEntryPattern } from '../../util/protocols.js';

// https://docs.cypress.io/guides/references/configuration

const title = 'Cypress';

const enablers = ['cypress'];

const isEnabled: IsPluginEnabled = ({ dependencies }) => hasDependency(dependencies, enablers);

const config = ['cypress.config.{js,ts,mjs,cjs}'];

const TEST_FILE_PATTERNS = ['cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'];

const SUPPORT_FILE_PATTERNS = [
  'cypress/support/e2e.{js,jsx,ts,tsx}',
  'cypress/support/commands.{js,ts}',
  'cypress/plugins/index.js', // Deprecated since Cypress v10
];

const entry = [...TEST_FILE_PATTERNS, ...SUPPORT_FILE_PATTERNS];

const resolveEntryPaths: ResolveEntryPaths = async localConfig => {
  const specPatterns = [localConfig.e2e?.specPattern ?? [], localConfig.component?.specPattern ?? []].flat();
  const supportFiles = [localConfig.e2e?.supportFile ?? [], localConfig.component?.supportFile ?? []].flat();
  return [
    ...(specPatterns.length > 0 ? specPatterns : TEST_FILE_PATTERNS),
    ...(supportFiles.length > 0 ? supportFiles : SUPPORT_FILE_PATTERNS),
  ].map(toEntryPattern);
};

export default {
  title,
  enablers,
  isEnabled,
  config,
  entry,
  resolveEntryPaths,
} satisfies Plugin;
