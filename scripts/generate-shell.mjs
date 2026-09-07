import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const manifestPath = join(process.cwd(), "dist", "client", ".vite", "manifest.json");
const outputPath = join(process.cwd(), "dist", "client", "index.html");
const templatePath = join(process.cwd(), "index.html");

try {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
  const template = readFileSync(templatePath, "utf-8");

  const entry = manifest["src/client.tsx"];
  if (!entry) {
    console.error("Entry not found in manifest");
    process.exit(1);
  }

  const cssLinks = (entry.css || [])
    .map((css) => `<link rel="stylesheet" href="/${css}" />`)
    .join("\n    ");

  const scriptTag = `<script type="module" src="/${entry.file}"></script>`;

  const html = template
    .replace("</head>", `    ${cssLinks}\n  </head>`)
    .replace('<script type="module" src="/src/client.tsx"></script>', scriptTag);

  writeFileSync(outputPath, html, "utf-8");
  console.log("Shell generated successfully");
} catch (err) {
  console.error("Error generating shell:", err.message);
  process.exit(1);
}
