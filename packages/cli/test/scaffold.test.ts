import { afterAll, beforeAll, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { scaffoldProject } from '../src/index';

let root: string;
beforeAll(() => { root = mkdtempSync(join(tmpdir(), 'volt-cli-test-')); });
afterAll(() => { rmSync(root, { recursive: true, force: true }); });

for (const template of ['api', 'minimal'] as const) {
  test(`${template} scaffold runs its tests and typechecks`, async () => {
    scaffoldProject(template, template, root);
    const project = join(root, template);
    const repo = resolve(import.meta.dir, '../../..');
    mkdirSync(join(project, 'node_modules', '.bin'), { recursive: true });
    symlinkSync(join(repo, 'packages/volt'), join(project, 'node_modules', 'voltts'), 'dir');
    symlinkSync(join(repo, 'node_modules/typescript'), join(project, 'node_modules', 'typescript'), 'dir');
    symlinkSync(join(repo, 'node_modules/@types'), join(project, 'node_modules', '@types'), 'dir');
    symlinkSync(join(repo, 'node_modules/.bin/tsc'), join(project, 'node_modules', '.bin', 'tsc'));
    symlinkSync(join(repo, 'packages/cli/bin/volt.ts'), join(project, 'node_modules', '.bin', 'volt'));
    for (const command of [['bun', 'test'], ['bun', 'run', 'typecheck'], ['bun', 'run', 'routes']]) {
      const child = Bun.spawn(command, { cwd: project, stdout: 'pipe', stderr: 'pipe' });
      const [code, stdout, stderr] = await Promise.all([child.exited, new Response(child.stdout).text(), new Response(child.stderr).text()]);
      if (code !== 0) throw new Error(`${command.join(' ')} failed: ${stdout}\n${stderr}`);
      if (command[2] === 'routes') expect(stdout).toContain('GET');
    }
  });
}

test('refuses invalid project names and existing directories', () => {
  expect(() => scaffoldProject('../unsafe', 'api', root)).toThrow();
  expect(() => scaffoldProject('api', 'api', root)).toThrow();
});

test('CLI accepts a template flag and rejects invalid options', async () => {
  const cli = resolve(import.meta.dir, '../bin/volt.ts');
  const run = async (args: string[]) => {
    const child = Bun.spawn([process.execPath, cli, ...args], { cwd: root, stdout: 'pipe', stderr: 'pipe', stdin: 'ignore' });
    return { code: await child.exited, out: await new Response(child.stdout).text(), err: await new Response(child.stderr).text() };
  };
  expect((await run(['new', 'cli-minimal', '--template', 'minimal'])).code).toBe(0);
  expect((await run(['new', 'default-api'])).code).toBe(0);
  expect((await run(['new', 'bad', '--template', 'missing'])).code).toBe(1);
  expect((await run(['new', 'bad', '--template'])).code).toBe(1);
});
