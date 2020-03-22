/* eslint no-console: 0 */

import util from 'util';
import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import chalk from 'chalk';

type PackageJSONData = {
  name: string;
  version: string;
};

const error = (str: string) => console.error(chalk.bold.red(str));
const log = (str: string) => console.log(chalk.gray(str));
const success = (str: string) => console.log(chalk.bold.green(str));

const jsonPath = path.join(__dirname, '/package.json');
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const exec = util.promisify(childProcess.exec);

async function buildAndPublish(
  name: string,
  path: string,
  json: PackageJSONData
) {
  json.name = name;

  await writeFile(jsonPath, JSON.stringify(json, null, 2));

  log(`Building ${name}...`);

  try {
    await exec(`rm -rf dist && tsc ${path} --outDir dist --declaration`);

    success(`${name} successfully built.`);
  } catch (err) {
    error(`Failed to build ${name}!`);
    throw err;
  }

  log(`Publishing ${name}...`);

  try {
    const { stdout } = await exec('npm publish');

    success(stdout);
  } catch (err) {
    error(`Failed to publish ${name}!`);
    throw err;
  }
}

async function main() {
  const file = await readFile(jsonPath, {
    encoding: 'utf-8'
  });

  const json = JSON.parse(file) as PackageJSONData;

  try {
    await buildAndPublish('ezmsg-web', 'src/web/index.ts', json);
    await buildAndPublish('ezmsg-node', 'src/node/index.ts', json);
  } catch (err) {
  } finally {
    await writeFile(jsonPath, file);
    await exec('rm -rf dist');
  }
}

main();
