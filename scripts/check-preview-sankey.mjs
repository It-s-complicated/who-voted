import assert from 'node:assert/strict';
import { defaultSettings, rangeControls, renderPreviewSankey } from '../src/components/preview-sankey.ts';

function check(settings) {
  const svg = renderPreviewSankey(settings);
  assert.ok(!/NaN|Infinity|undefined/.test(svg), 'finite geometry and colors');
  assert.ok(svg.includes(`viewBox="0 0 1120 ${settings.height}"`), 'portrait viewBox');
  const paths = [...svg.matchAll(/<path\b[^>]*\sd="([^"]+)"/g)];
  const bars = [...svg.matchAll(/<rect\b([^>]*)\/>/g)];
  assert.equal(paths.length, 16, 'one TanStack area per flow');
  assert.equal(bars.length, 11, 'all Sankey bars');
  assert.ok(paths.every((path) => path[1].endsWith('Z')), 'closed area shapes, not thick strokes');
  const attr = (bar, key) => Number(bar[1].match(new RegExp(`\\s${key}="([^"]+)"`))[1]);
  assert.ok(Math.abs(attr(bars[0], 'x')) < 0.03, 'origin starts at content edge');
  assert.ok(Math.abs(attr(bars[0], 'width') - 1120) < 0.03, 'full-width origin');
  const geometry = paths.map((path) => path[1].match(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi).map(Number));
  const originBottom = attr(bars[0], 'y') + settings.barHeight;
  assert.equal(geometry.filter((points) => Math.abs(points[1] - originBottom) < 0.03).length, 3, 'three starting ribbons');
  for (const points of geometry) {
    assert.equal(points.length, 16, 'two TanStack curve edges');
    const sourceCenter = (points[0] + points[14]) / 2;
    const targetCenter = (points[6] + points[8]) / 2;
    assert.ok(Math.abs(targetCenter - sourceCenter) < 560, 'no full-width ribbon sweeps');
    if (settings === defaultSettings) assert.ok(Math.abs(targetCenter - sourceCenter) > 12, 'default ribbons gently bend');
  }
  assert.ok(bars.every((bar) => Math.abs(attr(bar, 'height') - settings.barHeight) < 0.03), 'bar-height control');
  assert.ok(svg.includes(settings.blue), 'palette applied');
  return svg;
}

const baseline = check(defaultSettings);
for (const control of rangeControls) {
  for (const value of [control.min, control.max]) {
    check({ ...defaultSettings, [control.key]: value });
  }
  for (const value of [NaN, Infinity, control.min - 1, control.max + 1]) {
    assert.throws(() => renderPreviewSankey({ ...defaultSettings, [control.key]: value }), RangeError);
  }
}
for (const bound of ['min', 'max']) {
  const settings = { ...defaultSettings };
  for (const control of rangeControls) settings[control.key] = control[bound];
  check(settings);
}
assert.notEqual(check({ ...defaultSettings, neighbor: 12 }), baseline, 'neighbor weights change widths');
assert.notEqual(check({ ...defaultSettings, spacing: 100 }), baseline, 'spacing changes layout');
assert.notEqual(check({ ...defaultSettings, bend: 140 }), baseline, 'bend changes generated layer positions');
check({ ...defaultSettings, blue: '#aabbcc' });
assert.throws(() => renderPreviewSankey({ ...defaultSettings, blue: 'url(#bad)' }), TypeError);
console.log('Preview Sankey checks passed: TanStack geometry, controls, extremes, and validation.');
