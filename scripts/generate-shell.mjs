import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

const manifestPath = join(process.cwd(), "dist", "client", ".vite", "manifest.json");
const outputPath = join(process.cwd(), "dist", "client", "index.html");
const templatePath = join(process.cwd(), "index.html");
const serverDir = join(process.cwd(), "dist", "server");

function walk(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) acc = walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

try {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  const template = readFileSync(templatePath, "utf-8");

  const entryKeys = Object.keys(manifest);
  const entry =
    manifest["src/client.tsx"] ||
    manifest["node_modules/@tanstack/react-start/dist/plugin/default-entry/client.tsx"] ||
    manifest[entryKeys.find((k) => k.includes("client.tsx")) || ""];

  if (!entry) {
    console.error("Entry not found in manifest. Available keys:", entryKeys);
    process.exit(1);
  }

  const cssLinks = (entry.css || [])
    .map((css) => `<link rel="stylesheet" href="/${css}" />`)
    .join("\n    ");
  const scriptTag = `<script type="module" src="/${entry.file}"></script>`;

  // 1) SPA shell used by the static server (scripts/easypanel-server.mjs)
  const html = template
    .replace("</head>", `${cssLinks ? `    ${cssLinks}\n  ` : ""}  </head>`)
    .replace('<script type="module" src="/src/client.tsx"></script>', `    ${scriptTag}`);
  writeFileSync(outputPath, html, "utf-8");
  console.log("Shell generated for dist/client/index.html");

  // 2) Nitro SSR renderer template embedded in dist/server (_chunks/renderer-template.mjs).
  // Docker CMD is `node dist/server/index.mjs`, which always serves HTML from this template,
  // so it must reference the built assets too, or every page returns HTML pointing at
  // /src/client.tsx (MIME type "text/html" module-script error).
  if (existsSync(serverDir)) {
    const escapedCss = (entry.css || [])
      .map((css) => `<link rel="stylesheet" href="/${css}" />`)
      .join("\\n    ");
    for (const file of walk(serverDir)) {
      if (!file.endsWith(".mjs")) continue;
      const src = readFileSync(file, "utf-8");
      if (!src.includes('src="/src/client.tsx"')) continue;
      const headBlock = escapedCss ? ` />\\n    ${escapedCss}\\n  </head>` : " />\\n  </head>";
      const patched = src
        .replace(" />\\n  </head>", headBlock)
        .replace('src="/src/client.tsx"', `src="/${entry.file}"`);
      writeFileSync(file, patched, "utf-8");
      console.log("Patched SSR template:", file.replaceAll("\\", "/"));
    }
  }

  console.log("Shell generated successfully");
} catch (err) {
  console.error("Error generating shell:", err.message);
  process.exit(1);
}