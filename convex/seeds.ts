/* eslint-disable @typescript-eslint/no-explicit-any */
/** biome-ignore-all lint/suspicious/noExplicitAny: Not relevant */
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

const DEFAULT_PROJECTS = [
  {
    title: "Portfolio Website",
    description: "Personal portfolio built with Next.js and Tailwind",
  },
  { title: "Figma Clone", description: "Real-time collaborative design tool" },
  {
    title: "E-commerce Platform",
    description: "Full-stack storefront with Stripe integration",
  },
  { title: "Blog Engine", description: "Markdown-based blog with MDX support" },
  { title: "Task Manager", description: "Kanban board with drag-and-drop" },
  { title: "Chat Application", description: "WebSocket-based real-time chat" },
  {
    title: "Weather Dashboard",
    description: "Live weather with OpenWeather API",
  },
  { title: "Recipe Finder", description: "Search recipes by ingredients" },
  {
    title: "Fitness Tracker",
    description: "Workout logging and progress charts",
  },
  {
    title: "Music Player",
    description: "Audio streaming with playlist management",
  },
  {
    title: "Photo Gallery",
    description: "Image gallery with lightbox and lazy loading",
  },
  {
    title: "Expense Tracker",
    description: "Personal finance and budget management",
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
 * Seed the project table with default projects.
 * Also creates a test profile so project enrichment (username/ownerName) works.
 * Defaults to dryRun — pass { dryRun: false } to actually insert.
 * Use { force: true } to re-seed even if already run.
 */
export const seedProjects = internalMutation({
  args: {
    dryRun: v.optional(v.boolean()),
    force: v.optional(v.boolean()),
  },
  async handler(ctx, { dryRun = true, force = false }) {
    if (dryRun) {
      const existing = await ctx.db.query("project").collect();
      const existingTitles = new Set(existing.map((p) => p.title));
      const wouldInsert = DEFAULT_PROJECTS.filter(
        (p) => !existingTitles.has(p.title),
      );
      return {
        inserted: 0,
        skipped: DEFAULT_PROJECTS.length - wouldInsert.length,
        dryRun: true,
        wouldInsert: wouldInsert.map((p) => p.title),
      };
    }

    if (!force) {
      const alreadyRan = await ctx.db
        .query("migrations")
        .withIndex("by_name", (q) => q.eq("name", "seed:projects"))
        .first();
      if (alreadyRan) {
        return { inserted: 0, skipped: 0, dryRun: false, alreadyRan: true };
      }
    }

    // Ensure a test profile exists — projects are enriched with profile data
    // in listAll/search, so without this the results show "@anonymous".
    let profile = await ctx.db
      .query("profile")
      .withIndex("by_username", (q) => q.eq("username", "testuser"))
      .first();

    if (!profile) {
      const profileId = await ctx.db.insert("profile", {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        username: "testuser",
        phoneNumbers: [],
        profileImage: null,
        title: null,
      });
      profile = await ctx.db.get(profileId);
    }

    if (!profile) {
      throw new Error("Failed to create or find test profile");
    }

    const existing = await ctx.db.query("project").collect();
    const existingTitles = new Set(existing.map((p) => p.title));
    const wouldInsert = DEFAULT_PROJECTS.filter(
      (p) => !existingTitles.has(p.title),
    );

    let inserted = 0;
    for (const proj of wouldInsert) {
      await ctx.db.insert("project", {
        userId: profile._id as unknown as string,
        title: proj.title,
        description: proj.description,
        timeline: { start: null, end: null },
        ongoing: false,
        media: [],
        link: [],
      });
      inserted++;
    }

    await ctx.db.insert("migrations", {
      name: "seed:projects",
      type: "seed",
      status: "success",
      executedAt: Date.now(),
    });

    return {
      inserted,
      skipped: DEFAULT_PROJECTS.length - inserted,
      dryRun: false,
    };
  },
});

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
    const projects: any = await ctx.runMutation(internal.seeds.seedProjects, {
      dryRun,
      force,
    });

    return { skills, titles, projects };
  },
});
