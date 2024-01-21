import type { PackageJson } from '../types/package-json.js';

type Options = { cwd?: string; manifest?: PackageJson; knownGlobalsOnly?: boolean };

export type GetDependenciesFromScripts = (npmScripts: string | string[] | Set<string>, options?: Options) => string[];

type FromArgs = (args: string[]) => string[];

export type Resolver = (
  binary: string,
  args: string[],
  options: { cwd: string; manifest: PackageJson; fromArgs: FromArgs }
) => string[];
