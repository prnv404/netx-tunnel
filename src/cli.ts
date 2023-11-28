import flglet from "figlet";
import ora from "ora";
import chalk from "chalk";
export const printIntro = async (name: string) => {
	console.log(chalk.greenBright(flglet.textSync(name)));
	console.log(chalk.blue('A tunnel Server that expose your localhost application to public internt'))
	console.log('');
	const spinner = ora(chalk.italic("connecting to the tunnel server")).start();
	setTimeout(() => {
		spinner.stop()
	}, 5000);
};

printIntro("NET  X  TUNNEL");
