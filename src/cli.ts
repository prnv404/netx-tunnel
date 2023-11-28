import flglet from "figlet";
import chalk from "chalk";
import ora from "ora";
export const printIntro = (name: string) => {
	console.log(chalk.greenBright(flglet.textSync(name)));
	console.log(chalk.blue("A tunnel Server that expose your localhost application to public internt"));
	console.log("\n");
};

export const runSpinner = (text: string) => {
	const spinner = ora(chalk.italic(text));
	return spinner;
};
