#!/usr/bin/env node

import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {readFileSync} from 'fs';
import path from 'path';
import buildCommand from './commands/build';
import createCommand from './commands/create';

const pkg = JSON.parse(readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));

yargs(hideBin(process.argv))
    .scriptName("phact")
    .command(buildCommand)
    .command(createCommand)
    .strict()
    .version(pkg.version)
    .demandCommand(1, 'You need to specify a command')
    .help()
    .alias('h', 'help')
    .argv;