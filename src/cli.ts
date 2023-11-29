import flglet from "figlet";
import chalk from "chalk";
import ora from "ora";
import clear from "clear";

export const printIntro = (name: string) => {
	clear();
	console.log(chalk.greenBright(flglet.textSync(name)));
	console.log(chalk.bold("Localhost to World in a Snap! 🚀🌐"));
	console.log("\n");
};

export const runSpinner = (text: string) => {
	const spinner = ora(chalk.italic(text));
	return spinner;
};

export const printRequest = (reqId: string) => {
	const currentDate = new Date();
	const day = currentDate.getDate();
	const month = currentDate.getMonth() + 1;
	const year = currentDate.getFullYear();
	const hours = currentDate.getHours();
	const minutes = currentDate.getMinutes();
	const seconds = currentDate.getSeconds();
	// Format the date and time as a string
	const formattedDate = ` ${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
	console.log(chalk.bgGreen("Request") + " -----> " + chalk.bold(formattedDate));
};

export const printUrl = (url: string) => {
	const msg = `Bridge Localhost to the Universe! 🌌🌐  ${chalk.italic(url)}`;
	console.log(msg);
};
