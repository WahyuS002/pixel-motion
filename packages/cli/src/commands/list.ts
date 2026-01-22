import chalk from "chalk";
import ora from "ora";

const REGISTRY_URL =
  process.env.PIXEL_MOTION_REGISTRY_URL || "https://motion.pixeldeveloper.io/r";

interface RegistryItem {
  name: string;
  type: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
}

interface RegistryIndex {
  name: string;
  homepage: string;
  items: RegistryItem[];
}

async function fetchRegistryIndex(): Promise<RegistryIndex> {
  const response = await fetch(`${REGISTRY_URL}/registry.json`);
  if (!response.ok) {
    throw new Error(`Failed to fetch registry: ${response.statusText}`);
  }
  return response.json();
}

export async function list(options: { json?: boolean }) {
  const spinner = ora("Fetching registry...").start();

  try {
    const registry = await fetchRegistryIndex();
    spinner.stop();

    if (options.json) {
      console.log(JSON.stringify(registry.items, null, 2));
      return;
    }

    console.log(chalk.bold.green(`\n${registry.name} Components\n`));

    if (registry.items.length === 0) {
      console.log(chalk.yellow("  No components found in registry."));
      return;
    }

    // Calculate column widths
    const nameWidth = Math.max(
      ...registry.items.map((i) => i.name.length),
      4, // "Name" header
    );
    const typeWidth = Math.max(
      ...registry.items.map((i) => i.type.replace("registry:", "").length),
      4, // "Type" header
    );

    // Print header
    const header = `  ${chalk.bold("Name".padEnd(nameWidth))}  ${chalk.bold("Type".padEnd(typeWidth))}  ${chalk.bold("Description")}`;
    console.log(header);
    console.log(chalk.gray("  " + "-".repeat(70)));

    // Print each component
    for (const item of registry.items) {
      const name = chalk.cyan(item.name.padEnd(nameWidth));
      const type = chalk.yellow(
        item.type.replace("registry:", "").padEnd(typeWidth),
      );
      const description = item.description || chalk.gray("No description");

      console.log(`  ${name}  ${type}  ${description}`);

      // Show dependencies if any
      if (item.dependencies && item.dependencies.length > 0) {
        console.log(
          chalk.gray(`  ${"".padEnd(nameWidth)}  ${"".padEnd(typeWidth)}  deps: ${item.dependencies.join(", ")}`),
        );
      }
    }

    console.log(
      chalk.gray(`\n  ${registry.items.length} component(s) available\n`),
    );
    console.log(
      chalk.gray("  Run ") +
        chalk.cyan("npx pixel-motion add <name>") +
        chalk.gray(" to install a component.\n"),
    );
  } catch (error) {
    spinner.fail("Failed to fetch registry");
    console.error(chalk.red((error as Error).message));
    process.exit(1);
  }
}
