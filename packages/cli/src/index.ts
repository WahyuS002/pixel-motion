#!/usr/bin/env node
import { Command } from "commander";
import { init } from "./commands/init.js";
import { add } from "./commands/add.js";
import { list } from "./commands/list.js";

const program = new Command();

program
  .name("pixel-motion")
  .description("CLI for adding Motion Canvas components to your project")
  .version("1.0.0");

program
  .command("init")
  .description("Initialize pixel-motion in your project")
  .option("-y, --yes", "Skip prompts and use defaults", false)
  .action(init);

program
  .command("add")
  .description("Add components to your project")
  .argument("[components...]", "Components to add")
  .option("-o, --overwrite", "Overwrite existing files", false)
  .option("-a, --all", "Add all available components", false)
  .action(add);

program
  .command("list")
  .description("List all available components")
  .option("--json", "Output as JSON", false)
  .action(list);

program.parse();
