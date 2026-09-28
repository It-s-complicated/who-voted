export type DiagramNode = {
  id: string;
  label: string;
  value: number;
  voteUnit?: boolean;
  sourceValue?: number;
  color: string;
  order: number;
  callout?: boolean;
};

export type DiagramLink = { source: string; target: string; value: number };
