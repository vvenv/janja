// Converts the JSON written by `vitest bench --outputJson` into the
// "customBiggerIsBetter" format of benchmark-action/github-action-benchmark.
//
// Usage: node benchmark-results.mjs <vitest-output.json> <result.json>
import { readFile, writeFile } from 'node:fs/promises';

const [input, output] = process.argv.slice(2);

if (!input || !output) {
  console.error('Usage: benchmark-results.mjs <vitest-output.json> <result.json>');
  process.exit(1);
}

const { files } = JSON.parse(await readFile(input, 'utf-8'));

const results = files.flatMap(({ groups }) =>
  groups.flatMap(({ fullName, benchmarks }) =>
    benchmarks.map(({ name, hz, rme, sampleCount }) => ({
      name: `${fullName.replace(/^.*?> /, '')} > ${name}`,
      unit: 'ops/sec',
      value: Math.round(hz),
      range: `±${rme.toFixed(2)}%`,
      extra: `${sampleCount} samples`,
    })),
  ),
);

if (!results.length) {
  console.error(`No benchmarks found in ${input}`);
  process.exit(1);
}

await writeFile(output, `${JSON.stringify(results, null, 2)}\n`);
console.log(`Wrote ${results.length} benchmark results to ${output}`);
