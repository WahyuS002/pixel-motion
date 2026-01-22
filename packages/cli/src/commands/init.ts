import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import prompts from "prompts";
import chalk from "chalk";
import ora from "ora";

const DEFAULT_CONFIG = {
  style: "default",
  uiDir: "src/pixel-motion/ui",
  libDir: "src/pixel-motion/lib",
  typescript: true,
};

export async function init(options: { yes: boolean }) {
  console.log(chalk.bold.green("Welcome to the Pixel Motion CLI!\n"));

  const config = options.yes
    ? DEFAULT_CONFIG
    : await prompts([
        {
          type: "text",
          name: "uiDir",
          message: "Where would you like to store your motion UI components?",
          initial: DEFAULT_CONFIG.uiDir,
        },
        {
          type: "text",
          name: "libDir",
          message:
            "Where would you like to store your motion library components?",
          initial: DEFAULT_CONFIG.libDir,
        },
        {
          type: "select",
          name: "typescript",
          message: "Would you like to use TypeScript?",
          initial: true,
        },
      ]);

  const spinner = ora("Setting up your project...").start();

  // Create pixel-motion.config.json
  const configPath = path.resolve(process.cwd(), "pixel-motion.config.json");
  if (existsSync(configPath)) {
    spinner.fail(
      chalk.red(
        "A pixel-motion.config.json file already exists in this directory.",
      ),
    );
    process.exit(1);
  }

  writeFileSync(
    configPath,
    JSON.stringify(
      {
        style: DEFAULT_CONFIG.style,
        uiDir: config.uiDir,
        libDir: config.libDir,
        typescript: config.typescript,
      },
      null,
      2,
    ),
  );

  const uiPath = path.resolve(process.cwd(), config.uiDir);
  const libPath = path.resolve(process.cwd(), config.libDir);

  if (!existsSync(uiPath)) {
    mkdirSync(uiPath, { recursive: true });
  }

  if (!existsSync(libPath)) {
    mkdirSync(libPath, { recursive: true });
  }

  spinner.succeed(chalk.green("Project setup complete!"));

  console.log(
    chalk.green("\nYou're all set to start creating motion components!"),
  );
  console.log("  Next steps:");
  console.log(chalk.cyan("    npx pixel-motion add terminal"));
  console.log("");
}
