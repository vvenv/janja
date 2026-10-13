// Compares two results of `vitest bench --outputJson` that were measured on
// the same machine, and fails when a benchmark got much slower.
//
// Machines differ, and the same machine is not equally fast from one minute
// to the next. The engines Janja is compared with are not affected by changes
// to Janja, so how much they moved between the two runs is taken as the drift
// of the machine and removed from every other result.
//
// Usage: node benchmark-compare.mjs <base.json> <head.json> [threshold]
import { appendFile, readFile } from 'node:fs/promises';
import { env, exit } from 'node:process';

const [basePath, headPath, limit = '2'] = process.argv.slice(2);

if (!basePath || !headPath) {
  console.error('Usage: benchmark-compare.mjs <base.json> <head.json> [threshold]');
  exit(1);
}

const threshold = Number(limit);

const isControl = (file, name) =>
  file.endsWith('comparison.bench.ts') && name !== 'janja';

async function read(path) {
  const { files } = JSON.parse(await readFile(path, 'utf-8'));
  const results = new Map();

  for (const { groups } of files) {
    for (const { fullName, benchmarks } of groups) {
      const [file, ...group] = fullName.split(' > ');

      for (const { name, hz } of benchmarks) {
        results.set(`${fullName} > ${name}`, {
          label: `${group.join(' > ')} > ${name}`,
          control: isControl(file, name),
          hz,
        });
      }
    }
  }

  return results;
}

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;

  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};

const base = await read(basePath);
const head = await read(headPath);

// Benchmarks that exist on one side only have nothing to be compared with
const rows = [...head]
  .filter(([key, { hz }]) => hz > 0 && base.get(key)?.hz > 0)
  .map(([key, { label, control, hz }]) => ({
    label,
    control,
    base: base.get(key).hz,
    head: hz,
    // Above 1 means slower than before
    ratio: base.get(key).hz / hz,
  }));

if (!rows.length) {
  console.error('The two results have no benchmark in common');
  exit(1);
}

const controls = rows.filter(({ control }) => control);
const drift = controls.length ? median(controls.map(({ ratio }) => ratio)) : 1;

const slower = rows
  .map((row) => ({ ...row, slowdown: row.ratio / drift }))
  .filter(({ control, slowdown }) => !control && slowdown > threshold)
  .sort((a, b) => b.slowdown - a.slowdown);

const format = (hz) => Math.round(hz).toLocaleString('en-US');

const lines = [
  `Compared ${rows.length} benchmarks. The machine was ${drift.toFixed(2)}x ${
    drift >= 1 ? 'slower' : 'faster'
  } during the second run, measured on ${controls.length} benchmarks of other engines; this is removed from the figures below.`,
  '',
  slower.length
    ? `**${slower.length} benchmark(s) became more than ${threshold}x slower:**`
    : `No benchmark became more than ${threshold}x slower.`,
];

if (slower.length) {
  lines.push(
    '',
    '| Benchmark | Before (ops/sec) | After (ops/sec) | Slower by |',
    '| --- | ---: | ---: | ---: |',
    ...slower.map(
      ({ label, base: before, head: after, slowdown }) =>
        `| ${label} | ${format(before)} | ${format(after)} | ${slowdown.toFixed(2)}x |`,
    ),
  );
}

const report = `${lines.join('\n')}\n`;

console.log(report);

if (env.GITHUB_STEP_SUMMARY) {
  await appendFile(env.GITHUB_STEP_SUMMARY, `## Benchmarks\n\n${report}`);
}

exit(slower.length ? 1 : 0);
