import { existsSync, writeFileSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import chalk from "chalk";
import ora from "ora";
import { execSync } from "child_process";

const REGISTRY_URL =
  process.env.PIXEL_MOTION_REGISTRY_URL || "https://motion.pixeldeveloper.io/r";

interface RegistryFile {
  path: string;
  type: string;
  content: string;
}

interface RegistryItemJson {
  name: string;
  type: "registry:ui" | "registry:lib";
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: RegistryFile[];
}

interface RegistryIndex {
  name: string;
  homepage: string;
  items: {
    name: string;
    type: string;
    registryDependencies?: string[];
  }[];
}

function detectPackageManager(): "npm" | "pnpm" | "yarn" | "bun" {
  const cwd = process.cwd();

  // Check for lock files in order of preference
  if (
    existsSync(path.join(cwd, "bun.lockb")) ||
    existsSync(path.join(cwd, "bun.lock"))
  ) {
    return "bun";
  }
  if (existsSync(path.join(cwd, "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (existsSync(path.join(cwd, "yarn.lock"))) {
    return "yarn";
  }
  return "npm";
}

function getInstallCommand(
  pm: "npm" | "pnpm" | "yarn" | "bun",
  deps: string[],
): string {
  const depsStr = deps.join(" ");
  switch (pm) {
    case "bun":
      return `bun add ${depsStr}`;
    case "pnpm":
      return `pnpm add ${depsStr}`;
    case "yarn":
      return `yarn add ${depsStr}`;
    default:
      return `npm install ${depsStr}`;
  }
}

async function fetchRegistryIndex(): Promise<RegistryIndex> {
  const response = await fetch(`${REGISTRY_URL}/registry.json`);
  return response.json();
}

async function fetchComponent(name: string): Promise<RegistryItemJson> {
  const response = await fetch(`${REGISTRY_URL}/components/${name}.json`);
  if (!response.ok) {
    throw new Error(`Component "${name}" not found`);
  }
  return response.json();
}

function getConfig() {
  const configPath = path.join(process.cwd(), "pixel-motion.config.json");
  if (!existsSync(configPath)) {
    console.error(
      chalk.red(
        "No pixel-motion.config.json found. Run `npx pixel-motion init` first.",
      ),
    );
    process.exit(1);
  }
  return JSON.parse(readFileSync(configPath, "utf-8"));
}

export async function add(
  components: string[],
  options: { overwrite?: boolean; all?: boolean },
) {
  const config = getConfig();
  const spinner = ora("Fetching registry...").start();

  try {
    const registry = await fetchRegistryIndex();

    // Determine which components to add
    let componentNames: string[] = [];

    if (options.all) {
      componentNames = registry.items.map((i) => i.name);
    } else {
      // Resolve dependencies recursively
      const resolved = new Set<string>();
      const toResolve = [...components];

      while (toResolve.length > 0) {
        const name = toResolve.pop()!;
        if (resolved.has(name)) continue;

        const item = registry.items.find((i) => i.name === name);
        if (!item) {
          spinner.fail(`Component "${name}" not found in registry`);
          process.exit(1);
        }

        resolved.add(name);

        // Add registry dependencies to resolve queue
        if (item.registryDependencies) {
          for (const dep of item.registryDependencies) {
            if (!resolved.has(dep)) {
              toResolve.push(dep);
            }
          }
        }
      }

      componentNames = Array.from(resolved);
    }

    spinner.text = "Installing components...";

    // Track npm dependencies to install
    const npmDeps = new Set<string>();

    for (const name of componentNames) {
      // Fetch the component JSON (includes embedded source code)
      const component = await fetchComponent(name);

      // Collect npm dependencies
      if (component.dependencies) {
        component.dependencies.forEach((d) => npmDeps.add(d));
      }

      // Write each file
      for (const file of component.files) {
        // Determine destination based on file type
        const isUI = file.type === "registry:ui";
        const destDir = isUI ? config.uiDir : config.libDir;
        const destPath = path.join(
          process.cwd(),
          destDir,
          path.basename(file.path),
        );

        // Check if file exists
        if (existsSync(destPath) && !options.overwrite) {
          console.log(
            chalk.yellow(
              `  Skipping ${path.basename(file.path)} (already exists)`,
            ),
          );
          continue;
        }

        // Ensure directory exists
        const dir = path.dirname(destPath);
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }

        // Write file content (extracted from JSON)
        writeFileSync(destPath, file.content);
        console.log(chalk.green(`  ✓ ${path.basename(file.path)}`));
      }
    }

    spinner.succeed("Components installed!");

    // Auto-install npm dependencies
    if (npmDeps.size > 0) {
      const pm = detectPackageManager();
      const deps = [...npmDeps];
      const installCmd = getInstallCommand(pm, deps);

      console.log(chalk.yellow(`\n  Installing dependencies with ${pm}...`));
      console.log(chalk.gray(`  $ ${installCmd}\n`));

      const installSpinner = ora("Installing dependencies...").start();
      try {
        execSync(installCmd, { stdio: "pipe", cwd: process.cwd() });
        installSpinner.succeed("Dependencies installed!");
      } catch (error) {
        installSpinner.fail("Failed to install dependencies");
        console.log(chalk.yellow("\n  Please install manually:"));
        console.log(chalk.cyan(`    ${installCmd}`));
      }
    }

    console.log("");
  } catch (error) {
    spinner.fail("Failed to fetch registry");
    console.error(error);
    process.exit(1);
  }
}
