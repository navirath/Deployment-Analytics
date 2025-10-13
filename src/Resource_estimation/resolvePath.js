import path from "path";
import fs from "fs";

function resolveRepoRoot(repoPath) {
  repoPath = path.resolve(repoPath); // always absolute
  console.log("Resolved Path:", repoPath);

  // List all files for debugging
  console.log("Files at path:", fs.readdirSync(repoPath));

  // If package.json exists here → return
  if (fs.existsSync(path.join(repoPath, "package.json"))) {
    console.log("package.json found at root");
    return repoPath;
  }

  // Otherwise, check subfolders
  for (const f of fs.readdirSync(repoPath)) {
    const sub = path.join(repoPath, f);
    if (fs.statSync(sub).isDirectory()) {
      if (fs.existsSync(path.join(sub, "package.json"))) {
        console.log("package.json found in subdirectory:", sub);
        return sub;
      }
    }
  }

  console.log("No package.json found at root or first level");
  return repoPath; // fallback
}
