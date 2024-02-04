import { OwnershipEngine } from '@snyk/github-codeowners/dist/lib/ownership/index.js';
import { isFile } from '../util/fs.js';
import { relative, resolve } from '../util/path.js';
import { convert } from './util.js';
import type { Report, ReporterOptions, IssueRecords, SymbolIssueType, Issue } from '../types/issues.js';
import type { Entries } from 'type-fest';

type ExtraReporterOptions = {
  codeowners?: string;
};

type Item = { name: string; pos?: number; line?: number; col?: number };

type Row = {
  file: string;
  owners: Array<{ name: string }>;
  dependencies?: Array<{ name: string }>;
  devDependencies?: Array<{ name: string }>;
  optionalPeerDependencies?: Array<{ name: string }>;
  unlisted?: Array<{ name: string }>;
  binaries?: Array<{ name: string }>;
  unresolved?: Array<{ name: string }>;
  exports?: Array<Item>;
  nsExport?: Array<Item>;
  nsType?: Array<Item>;
  types?: Array<Item>;
  duplicates?: Array<Item[]>;
  enumMembers?: Record<string, Array<Item>>;
  classMembers?: Record<string, Array<Item>>;
};

const mergeTypes = (type: SymbolIssueType) =>
  type === 'exports' || type === 'nsExports' ? 'exports' : type === 'types' || type === 'nsTypes' ? 'types' : type;

export default async ({ report, issues, options }: ReporterOptions) => {
  let opts: ExtraReporterOptions = {};
  try {
    opts = options ? JSON.parse(options) : opts;
  } catch (error) {
    console.error(error);
  }

  const json: Record<string, Row> = {};
  const codeownersFilePath = resolve(opts.codeowners ?? '.github/CODEOWNERS');
  const codeownersEngine = isFile(codeownersFilePath) && OwnershipEngine.FromCodeownersFile(codeownersFilePath);

  const flatten = (issues: IssueRecords): Issue[] => Object.values(issues).flatMap(Object.values);

  const initRow = (filePath: string) => {
    const file = relative(filePath);
    const row: Row = {
      file,
      ...(codeownersEngine && { owners: codeownersEngine.calcFileOwnership(file) }),
      ...(report.dependencies && { dependencies: [] }),
      ...(report.devDependencies && { devDependencies: [] }),
      ...(report.optionalPeerDependencies && { optionalPeerDependencies: [] }),
      ...(report.unlisted && { unlisted: [] }),
      ...(report.binaries && { binaries: [] }),
      ...(report.unresolved && { unresolved: [] }),
      ...((report.exports || report.nsExports) && { exports: [] }),
      ...(report.nsExport && { nsExport: [] }),
      ...((report.types || report.nsTypes) && { types: [] }),
      ...(report.nsType && { nsType: [] }),
      ...(report.enumMembers && { enumMembers: {} }),
      ...(report.classMembers && { classMembers: {} }),
      ...(report.duplicates && { duplicates: [] }),
    };
    return row;
  };

  for (const [reportType, isReportType] of Object.entries(report) as Entries<Report>) {
    if (isReportType) {
      if (reportType === 'files') {
        // Ignore
      } else {
        const type = mergeTypes(reportType);
        flatten(issues[reportType] as IssueRecords).forEach(issue => {
          const { filePath, symbol, symbols, parentSymbol } = issue;
          json[filePath] = json[filePath] ?? initRow(filePath);
          if (type === 'duplicates') {
            symbols && json[filePath][type]?.push(symbols.map(convert));
          } else if (type === 'enumMembers' || type === 'classMembers') {
            const item = json[filePath][type];
            if (parentSymbol && item) {
              item[parentSymbol] = item[parentSymbol] ?? [];
              item[parentSymbol].push(convert(issue));
            }
          } else {
            if (type === 'exports' || type === 'types' || type === 'unresolved') {
              json[filePath][type]?.push(convert(issue));
            } else {
              json[filePath][type]?.push({ name: symbol });
            }
          }
        });
      }
    }
  }

  console.log(
    JSON.stringify({
      files: Array.from(issues.files).map(filePath => relative(filePath)),
      issues: Object.values(json),
    })
  );
};
