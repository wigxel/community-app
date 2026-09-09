import { queryGeneric as query } from "convex/server";
import { internalMutation } from "./_generated/server";

// Query to list skills
export const listSkills = query({
  args: {},
  async handler(ctx) {
    return await ctx.db.query("skills").collect();
  },
});

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

/**
 * Seed the skills table with default skills.
 * Skips any skill whose name already exists to make it safe to run repeatedly.
 */
export const seedSkills = internalMutation({
  args: {},
  async handler(ctx) {
    const existing = await ctx.db.query("skills").collect();
    const existingNames = new Set(existing.map((s) => s.name));

    let inserted = 0;
    for (const skill of DEFAULT_SKILLS) {
      if (!existingNames.has(skill.name)) {
        await ctx.db.insert("skills", {
          name: skill.name,
          description: skill.description,
        });
        inserted++;
      }
    }
    return { inserted, skipped: DEFAULT_SKILLS.length - inserted };
  },
});
