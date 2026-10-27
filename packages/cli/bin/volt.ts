#!/usr/bin/env bun
import { devServer, inspectRoutes, printHelp, createProject } from '../src/index';

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'dev':
    devServer(args[1]);
    break;

  case 'routes':
    inspectRoutes(args[1]);
    break;

  case 'new':
    try {
      await createProject(args.slice(1));
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
    break;

  case 'version':
  case '-v':
  case '--version':
    console.log('⚡ Volt v0.1.0');
    break;

  case 'help':
  case '-h':
  case '--help':
  default:
    printHelp();
    break;
}
