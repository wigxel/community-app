import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

const DEFAULT_SKILLS = [
  // Programming Languages
  { name: "JavaScript", description: "Web and server-side scripting language" },
  { name: "TypeScript", description: "Typed superset of JavaScript" },
  { name: "Python", description: "General-purpose programming language" },
  { name: "Java", description: "Object-oriented programming language" },
  { name: "C#", description: ".NET ecosystem programming language" },
  { name: "C++", description: "Systems and performance-critical programming" },
  { name: "Go", description: "Concurrent, compiled programming language" },
  { name: "Rust", description: "Memory-safe systems programming language" },
  { name: "PHP", description: "Server-side web scripting language" },
  { name: "Ruby", description: "Dynamic, object-oriented language" },
  { name: "Swift", description: "Apple platforms programming language" },
  { name: "Kotlin", description: "Modern JVM programming language" },
  { name: "Dart", description: "Client-optimized programming language" },
  { name: "Solidity", description: "Smart contract programming language" },

  // Frontend
  { name: "React", description: "UI component library for the web" },
  { name: "Next.js", description: "React framework for production" },
  { name: "Vue.js", description: "Progressive JavaScript framework" },
  { name: "Angular", description: "TypeScript-based web framework" },
  { name: "Svelte", description: "Compile-time reactive UI framework" },
  {
    name: "TanStack Start",
    description: "Full-stack React framework with typesafe routing",
  },
  { name: "HTML/CSS", description: "Web markup and styling" },
  { name: "Tailwind CSS", description: "Utility-first CSS framework" },
  { name: "React Native", description: "Cross-platform mobile with React" },
  { name: "Flutter", description: "Cross-platform UI toolkit" },

  // Backend & Infrastructure
  { name: "Node.js", description: "JavaScript runtime for servers" },
  { name: "Express.js", description: "Minimal Node.js web framework" },
  {
    name: "NestJS",
    description: "Progressive Node.js framework for scalable server-side apps",
  },
  { name: "Django", description: "Python web framework" },
  { name: "FastAPI", description: "Modern Python API framework" },
  { name: "Spring Boot", description: "Java microservices framework" },
  { name: "Laravel", description: "PHP web application framework" },
  { name: "Ruby on Rails", description: "Full-stack Ruby framework" },
  { name: "GraphQL", description: "API query language" },
  { name: "REST APIs", description: "RESTful API design and development" },

  // Databases
  { name: "PostgreSQL", description: "Advanced relational database" },
  { name: "MongoDB", description: "Document-oriented NoSQL database" },
  { name: "MySQL", description: "Popular relational database" },
  { name: "Redis", description: "In-memory data store" },
  { name: "Firebase", description: "Google app development platform" },
  { name: "Convex", description: "Reactive backend platform" },
  { name: "Supabase", description: "Open-source Firebase alternative" },

  // DevOps & Cloud
  { name: "Docker", description: "Containerization platform" },
  { name: "Kubernetes", description: "Container orchestration" },
  { name: "AWS", description: "Amazon cloud services" },
  { name: "Google Cloud", description: "Google cloud platform" },
  { name: "Azure", description: "Microsoft cloud platform" },
  { name: "CI/CD", description: "Continuous integration and delivery" },
  { name: "Linux", description: "Linux system administration" },
  { name: "Git", description: "Version control system" },

  // Data & AI
  { name: "Machine Learning", description: "Building predictive models" },
  { name: "Data Science", description: "Data analysis and insights" },
  { name: "Deep Learning", description: "Neural network architectures" },
  { name: "NLP", description: "Natural language processing" },
  { name: "Computer Vision", description: "Image and video analysis" },
  { name: "TensorFlow", description: "ML framework by Google" },
  { name: "PyTorch", description: "ML framework by Meta" },
  { name: "Data Engineering", description: "Building data pipelines" },

  // Design & Creative
  { name: "UI/UX Design", description: "User interface and experience design" },
  { name: "Figma", description: "Collaborative design tool" },
  { name: "Adobe XD", description: "UI/UX design tool" },
  { name: "Photoshop", description: "Image editing and compositing" },
  { name: "Illustrator", description: "Vector graphics editor" },
  { name: "Blender", description: "3D modeling and animation" },
  { name: "Motion Design", description: "Animation and motion graphics" },

  // Other Technical
  { name: "Cybersecurity", description: "Security practices and tools" },
  { name: "Blockchain", description: "Distributed ledger technology" },
  { name: "Web3", description: "Decentralized web development" },
  { name: "IoT", description: "Internet of Things development" },
  { name: "Game Development", description: "Building interactive games" },
  { name: "Unity", description: "Cross-platform game engine" },
  { name: "Unreal Engine", description: "AAA game engine" },

  // Soft / Professional
  { name: "Technical Writing", description: "Documentation and guides" },
  {
    name: "Project Management",
    description: "Planning and delivering projects",
  },
  { name: "Agile/Scrum", description: "Agile development methodology" },
  { name: "Product Management", description: "Product strategy and execution" },
  { name: "DevRel", description: "Developer relations and advocacy" },
  { name: "Community Building", description: "Growing tech communities" },
  { name: "Open Source", description: "Contributing to open-source projects" },
] as const;

const DEFAULT_TITLES = [
  // Software
  {
    name: "Frontend Developer",
    description: "Builds user interfaces and client-side experiences",
    color: "#3B82F6",
  },
  {
    name: "Backend Developer",
    description: "Builds server-side logic and APIs",
    color: "#3B82F6",
  },
  {
    name: "Fullstack Developer",
    description: "Works across frontend and backend",
    color: "#3B82F6",
  },
  {
    name: "Mobile Developer",
    description: "Builds iOS and Android applications",
    color: "#3B82F6",
  },
  {
    name: "DevOps Engineer",
    description: "Manages infrastructure, CI/CD, and deployment pipelines",
    color: "#3B82F6",
  },

  // Technical
  {
    name: "Data Scientist",
    description: "Analyzes data and builds predictive models",
    color: "#8B5CF6",
  },
  {
    name: "ML Engineer",
    description: "Builds and deploys machine learning systems",
    color: "#8B5CF6",
  },
  {
    name: "Cloud Architect",
    description: "Designs and manages cloud infrastructure",
    color: "#8B5CF6",
  },
  {
    name: "Solutions Architect",
    description: "Designs technical solutions for business problems",
    color: "#8B5CF6",
  },
  {
    name: "Security Engineer",
    description: "Protects systems and data from threats",
    color: "#8B5CF6",
  },
  {
    name: "Technical Writer",
    description: "Creates documentation and technical guides",
    color: "#8B5CF6",
  },

  // Design
  {
    name: "UI/UX Designer",
    description: "Designs user interfaces and experiences",
    color: "#EC4899",
  },
  {
    name: "Product Designer",
    description: "End-to-end product design from research to delivery",
    color: "#EC4899",
  },
  {
    name: "Graphic Designer",
    description: "Creates visual content for print and digital media",
    color: "#EC4899",
  },
  {
    name: "2D Artist",
    description: "Creates two-dimensional art and illustrations",
    color: "#EC4899",
  },
  {
    name: "3D Artist",
    description: "Creates three-dimensional models and renders",
    color: "#EC4899",
  },
  {
    name: "Motion Designer",
    description: "Creates animations and motion graphics",
    color: "#EC4899",
  },
  {
    name: "Brand Designer",
    description: "Develops visual brand identities",
    color: "#EC4899",
  },

  // Leadership
  {
    name: "Engineering Manager",
    description: "Leads and manages engineering teams",
    color: "#F59E0B",
  },
  {
    name: "Product Manager",
    description: "Defines product strategy and roadmap",
    color: "#F59E0B",
  },
] as const;

/**
 * Seed the skills table with default skills.
 * Defaults to dryRun — pass { dryRun: false } to actually insert.
 * Use { force: true } to re-seed even if already run.
 */
export const seedSkills = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
    force: v.optional(v.boolean()),
  },
  async handler(ctx, { dryRun = true, force = false }) {
    if (dryRun) {
      const existing = await ctx.db.query("skills").collect();
      const existingNames = new Set(existing.map((s) => s.name));
      const wouldInsert = DEFAULT_SKILLS.filter(
        (s) => !existingNames.has(s.name),
      );
      return {
        inserted: 0,
        skipped: DEFAULT_SKILLS.length - wouldInsert.length,
        dryRun: true,
        wouldInsert: wouldInsert.map((s) => s.name),
      };
    }

    if (!force) {
      const alreadyRan = await ctx.db
        .query("migrations")
        .withIndex("by_name", (q) => q.eq("name", "seed:skills"))
        .first();
      if (alreadyRan) {
        return { inserted: 0, skipped: 0, dryRun: false, alreadyRan: true };
      }
    }

    const existing = await ctx.db.query("skills").collect();
    const existingNames = new Set(existing.map((s) => s.name));
    const wouldInsert = DEFAULT_SKILLS.filter(
      (s) => !existingNames.has(s.name),
    );

    let inserted = 0;
    for (const skill of wouldInsert) {
      await ctx.db.insert("skills", {
        name: skill.name,
        description: skill.description,
      });
      inserted++;
    }

    await ctx.db.insert("migrations", {
      name: "seed:skills",
      type: "seed",
      status: "success",
      executedAt: Date.now(),
    });

    return {
      inserted,
      skipped: DEFAULT_SKILLS.length - inserted,
      dryRun: false,
    };
  },
});

/**
 * Seed the titles table with default titles.
 * Defaults to dryRun — pass { dryRun: false } to actually insert.
 * Use { force: true } to re-seed even if already run.
 */
export const seedTitles = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
    force: v.optional(v.boolean()),
  },
  async handler(ctx, { dryRun = true, force = false }) {
    if (dryRun) {
      const existing = await ctx.db.query("titles").collect();
      const existingNames = new Set(existing.map((t) => t.name));
      const wouldInsert = DEFAULT_TITLES.filter(
        (t) => !existingNames.has(t.name),
      );
      return {
        inserted: 0,
        skipped: DEFAULT_TITLES.length - wouldInsert.length,
        dryRun: true,
        wouldInsert: wouldInsert.map((t) => t.name),
      };
    }

    if (!force) {
      const alreadyRan = await ctx.db
        .query("migrations")
        .withIndex("by_name", (q) => q.eq("name", "seed:titles"))
        .first();
      if (alreadyRan) {
        return { inserted: 0, skipped: 0, dryRun: false, alreadyRan: true };
      }
    }

    const existing = await ctx.db.query("titles").collect();
    const existingNames = new Set(existing.map((t) => t.name));
    const wouldInsert = DEFAULT_TITLES.filter(
      (t) => !existingNames.has(t.name),
    );

    let inserted = 0;
    for (const title of wouldInsert) {
      await ctx.db.insert("titles", {
        name: title.name,
        description: title.description,
        color: title.color,
      });
      inserted++;
    }

    await ctx.db.insert("migrations", {
      name: "seed:titles",
      type: "seed",
      status: "success",
      executedAt: Date.now(),
    });

    return {
      inserted,
      skipped: DEFAULT_TITLES.length - inserted,
      dryRun: false,
    };
  },
});

/**
 * Seed all tables (skills + titles).
 * Defaults to dryRun — pass { dryRun: false } to actually insert.
 * Use { force: true } to re-seed even if already run.
 */
export const seedSome = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
    force: v.optional(v.boolean()),
  },
  async handler(ctx, { dryRun = true, force = false }) {
    const skills: any = await ctx.runMutation(internal.seeds.seedSkills, {
      dryRun,
      force,
    });
    const titles: any = await ctx.runMutation(internal.seeds.seedTitles, {
      dryRun,
      force,
    });

    return { skills, titles };
  },
});
