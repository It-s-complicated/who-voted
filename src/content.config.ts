import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { electionSchema } from "./data/election";
import { states } from "./data/states";

const loader = glob({
  pattern: "*/*.json",
  base: "./public/data",
  generateId: ({ entry, data }) => {
    const id = entry.replace(/\.json$/, "");
    if (id !== `${(data.state as { slug?: string } | undefined)?.slug}/${data.year}`) {
      throw new Error(`${entry}: dataset state/year does not match its file path`);
    }
    return id;
  },
});

const elections = defineCollection({
  loader: {
    ...loader,
    async load(context) {
      await loader.load(context);
      const expected = Object.entries(states).flatMap(([state, { years }]) =>
        years.map((year) => `${state}/${year}`),
      );
      for (const id of expected) {
        if (!context.store.has(id)) throw new Error(`Missing election dataset: ${id}`);
      }
      for (const id of context.store.keys()) {
        if (!expected.includes(id)) throw new Error(`Unconfigured election dataset: ${id}`);
      }
    },
  },
  schema: electionSchema,
});

export const collections = { elections };
