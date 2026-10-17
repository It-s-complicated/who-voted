import { areaX, createChartScene, defineChart, rect, renderChartSvg } from "@tanstack/charts";
import { d3AreaXCurve } from "@tanstack/charts/d3/area-x";
import { sankeyDiagram } from "@tanstack/charts/network/sankey";
import { curveBumpY } from "d3-shape";

export const defaultSettings = {
  spacing: 48,
  barHeight: 16,
  bend: 96,
  neighbor: 16,
  height: 820,
  fadeStart: 42,
  fadeEnd: 100,
  spotOpacity: 100,
  spotSize: 100,
  blue: "#b3c2cd",
  clay: "#d6b9a9",
  sage: "#bbc6b0",
  gold: "#dfcda9",
};
export type PreviewSettings = typeof defaultSettings;

export const rangeControls = [
  { key: "spacing", label: "Node spacing", min: 0, max: 120, step: 2, unit: "px" },
  { key: "barHeight", label: "Bar height", min: 4, max: 32, step: 1, unit: "px" },
  { key: "bend", label: "Ribbon bend", min: 48, max: 140, step: 2, unit: "px" },
  { key: "neighbor", label: "Neighbor-flow width", min: 12, max: 21, step: 1, unit: "%" },
  { key: "height", label: "Graphic height", min: 600, max: 1200, step: 10, unit: "px" },
  { key: "fadeStart", label: "Fade start", min: 0, max: 75, step: 1, unit: "%" },
  { key: "fadeEnd", label: "Fade end", min: 80, max: 100, step: 1, unit: "%" },
  { key: "spotOpacity", label: "Heading clearing", min: 0, max: 100, step: 1, unit: "%" },
  { key: "spotSize", label: "Clearing size", min: 60, max: 160, step: 1, unit: "%" },
] as const;

export const colorControls = [
  { key: "blue", label: "Blue" },
  { key: "clay", label: "Clay" },
  { key: "sage", label: "Sage" },
  { key: "gold", label: "Sand" },
] as const;

export function renderPreviewSankey(settings: PreviewSettings = defaultSettings): string {
  for (const control of rangeControls) {
    const value = settings[control.key];
    if (!Number.isFinite(value) || value < control.min || value > control.max) {
      throw new RangeError(`Invalid ${control.label}`);
    }
  }
  for (const control of colorControls) {
    if (!/^#[\da-f]{6}$/i.test(settings[control.key])) throw new TypeError(`Invalid ${control.label} color`);
  }
  const nodes = [
    { id: "origin", color: settings.blue, order: 0 },
    { id: "first-blue", color: settings.blue, order: 0 },
    { id: "first-clay", color: settings.clay, order: 1 },
    { id: "first-sage", color: settings.sage, order: 2 },
    { id: "middle-blue", color: settings.blue, order: 0 },
    { id: "middle-clay", color: settings.clay, order: 1 },
    { id: "middle-sage", color: settings.sage, order: 2 },
    { id: "last-blue", color: settings.blue, order: 0 },
    { id: "last-gold", color: settings.gold, order: 1 },
    { id: "last-sage", color: settings.sage, order: 2 },
    { id: "end", color: settings.blue, order: 0 },
  ];
  // Exchange flow only between neighbors; never send a ribbon across the whole chart.
  const neighbor = settings.neighbor;
  const links = [
    { source: "origin", target: "first-blue", value: 34 },
    { source: "origin", target: "first-clay", value: 33 },
    { source: "origin", target: "first-sage", value: 33 },
    { source: "first-blue", target: "middle-blue", value: 34 - neighbor },
    { source: "first-blue", target: "middle-clay", value: neighbor },
    { source: "first-clay", target: "middle-blue", value: neighbor },
    { source: "first-clay", target: "middle-clay", value: 33 - neighbor },
    { source: "first-sage", target: "middle-sage", value: 33 },
    { source: "middle-blue", target: "last-blue", value: 34 },
    { source: "middle-clay", target: "last-gold", value: 33 - neighbor },
    { source: "middle-clay", target: "last-sage", value: neighbor },
    { source: "middle-sage", target: "last-gold", value: neighbor },
    { source: "middle-sage", target: "last-sage", value: 33 - neighbor },
    { source: "last-blue", target: "end", value: 34 },
    { source: "last-gold", target: "end", value: 33 },
    { source: "last-sage", target: "end", value: 33 },
  ];
  const colors = colorControls.map(({ key }) => settings[key]);
  const chart = defineChart({
    marks: [sankeyDiagram({
      nodes,
      links,
      nodeKey: "id",
      source: "source",
      target: "target",
      value: "value",
      align: "left",
      nodeSort: (a, b) => a.data.order - b.data.order,
      linkSort: null,
      nodeWidth: settings.barHeight,
      nodePadding: settings.spacing,
      inset: { left: 10, right: 9 },
      marks: ({ nodes: layoutNodes, links: layoutLinks }) => {
        // Transpose TanStack's layout, moving each layer as a unit to keep bends attached to bars.
        const origin = layoutNodes.find((node) => node.data.id === "origin")!;
        function horizontalOffset(layer: number): number {
          return Math.sin(layer * Math.PI / 2) * settings.bend - origin.y0;
        }
        const bars = layoutNodes.map((node) => ({
          key: node.key,
          x0: node.y0 + horizontalOffset(node.layer),
          x1: node.y1 + horizontalOffset(node.layer),
          y0: node.x0,
          y1: node.x1,
          color: node.data.color,
        }));
        const bands = layoutLinks.flatMap((flow) => [
          {
            key: flow.key,
            x1: flow.y1 - flow.width / 2 + horizontalOffset(flow.sourceNode.layer),
            x2: flow.y1 + flow.width / 2 + horizontalOffset(flow.sourceNode.layer),
            y: flow.x1,
            color: flow.targetNode.data.color,
          },
          {
            key: flow.key,
            x1: flow.y2 - flow.width / 2 + horizontalOffset(flow.targetNode.layer),
            x2: flow.y2 + flow.width / 2 + horizontalOffset(flow.targetNode.layer),
            y: flow.x2,
            color: flow.targetNode.data.color,
          },
        ]);
        return [
          areaX(bands, {
            x1: "x1", x2: "x2", y: "y", z: "key",
            fill: (band) => band.color,
            fillOpacity: 1,
            curve: d3AreaXCurve(curveBumpY),
          }),
          rect(bars, {
            x1: "x0", x2: "x1", y1: "y0", y2: "y1", key: "key",
            color: (bar) => bar.color,
            stroke: "#f8f5ee", strokeWidth: 1.5, inset: 0,
          }),
        ] as const;
      },
    })],
    scales: { x: null, y: null },
    guides: false,
    margin: 0,
    color: { domain: colors, range: colors },
    theme: { focusRing: false },
  });

  // The widest layer has three nodes; allow its two gaps without shrinking the origin.
  const scene = createChartScene(chart, { width: settings.height, height: 1120 + 2 * settings.spacing });
  return renderChartSvg(scene, { ariaLabel: "Illustrative background Sankey" })
    .replace(/viewBox="[^"]+"/, `viewBox="0 0 1120 ${settings.height}" preserveAspectRatio="none"`)
    .replaceAll(' vector-effect="non-scaling-stroke"', "");
}
