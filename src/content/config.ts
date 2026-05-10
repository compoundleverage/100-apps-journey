import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const mentorVersion = z.enum(["v1-bootstrap", "v2-distilled"]);

const mentalModel = z.object({
  name: z.string().min(2),
  summary: z.string().min(10),
  evidence: z.array(z.string()).default([]),
  application: z.string().optional(),
  limits: z.string().optional(),
});

const decisionHeuristic = z.object({
  rule: z.string().min(5),
  when: z.string().min(5),
  example: z.string().optional(),
});

const expressionDna = z.object({
  sentence_style: z.string(),
  vocabulary: z.string(),
  rhythm: z.string(),
  humor: z.string(),
  certainty: z.string(),
  citation_habits: z.string(),
});

const sourceRef = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  type: z
    .enum(["book", "essay", "talk", "interview", "podcast", "tweet", "video", "site", "other"])
    .optional(),
  note: z.string().optional(),
});

const agenticProtocol = z.object({
  research_dimensions: z.array(
    z.object({
      name: z.string(),
      looks_for: z.array(z.string()).min(1),
    }),
  ),
});

const mentors = defineCollection({
  loader: glob({
    pattern: "*/SKILL.md",
    base: "./src/content/mentors",
    // Use the directory name as the slug (e.g. "karpathy") instead of "karpathy/skill"
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: z.object({
    name: z.string(),
    short_bio: z.string(),
    avatar_initials: z.string().length(2),
    accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),

    // For above-the-fold on /mentors/[slug]
    epitaph: z.string(),
    epitaph_source: z.string().optional(),

    // The actual prompt fed to evaluator. NOT in body — body is human-readable detail.
    system_prompt: z.string().min(150),

    // Optional structured per-mentor research-dimensions for evaluate.ts agentic protocol.
    agentic_protocol: agenticProtocol.optional(),

    // Distillation outputs
    mental_models: z.array(mentalModel).min(1).max(10),
    decision_heuristics: z.array(decisionHeuristic).min(1).max(15),
    expression_dna: expressionDna,
    tells: z.array(z.string()).default([]),
    values: z.array(z.string()).default([]),
    anti_patterns: z.array(z.string()).default([]),
    tensions: z.array(z.string()).default([]),
    intellectual_lineage: z.string().optional(),
    boundaries: z.array(z.string()).min(1),

    research_date: z.coerce.date(),
    primary_sources: z.array(sourceRef).default([]),
    secondary_sources: z.array(sourceRef).default([]),

    version: mentorVersion,
    sort_order: z.number().int().default(99),
  }),
});

const ideas = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/ideas" }),
  schema: z.object({
    id: z.number().int().positive(),
    title: z.string(),
    status: z.enum(["idea", "building", "shipped", "killed"]),
    date_added: z.coerce.date(),
    date_started: z.coerce.date().optional().nullable(),
    date_shipped: z.coerce.date().optional().nullable(),
    date_killed: z.coerce.date().optional().nullable(),
    thesis: z.string().min(10),
    kill_criteria: z.string().min(10),
    time_budget: z.string(),
    actual_time: z.string().optional().nullable(),
    url: z.string().url().optional().nullable(),
    repo: z.string().url().optional().nullable(),
    tags: z.array(z.string()).default([]),

    // Progressive disclosure: how much to show external visitors.
    // "auto" defers to status: idea→title, building→thesis, shipped/killed→full.
    // dev mode (`bun run dev`) ignores all gating and shows full.
    disclosure: z.enum(["auto", "full", "thesis", "title"]).default("auto"),

    investor_evaluations: z
      .array(
        z.object({
          // Mentor slug; cross-validated at build time against mentors collection.
          persona: z.string().min(1),
          score: z.number().int().min(1).max(10),
          reasoning: z.string().min(1),
          generated_at: z.coerce.date().optional(),
          model: z.string().optional(),
          // Stamp the mentor version evaluations were generated against.
          // If mentor SKILL.md changes version (v1→v2), evaluations should be regenerated.
          mentor_version: mentorVersion.optional(),
        }),
      )
      .default([]),
  }),
});

export const collections = { ideas, mentors };
