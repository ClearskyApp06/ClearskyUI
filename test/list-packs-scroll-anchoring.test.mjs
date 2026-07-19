import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const stylesheet = await readFile(
  new URL('../src/detail-panels/packs/list-packs.css', import.meta.url),
  'utf8'
);

test('starter-pack pagination sentinels do not become scroll anchors', () => {
  assert.match(
    stylesheet,
    /\.packs-as-pack-view\s*>\s*:last-child,\s*\.packs-as-pack-view\s*\+\s*div\s*{[^}]*overflow-anchor:\s*none;/s,
    'starter-pack pagination sentinels must disable scroll anchoring'
  );
});
