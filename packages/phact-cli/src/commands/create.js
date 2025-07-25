import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import {execa} from 'execa';
import chalk from 'chalk';
import ora from 'ora';


function createComposerConfig(projectName) {
    return {
        "name": `your-vendor/${projectName}`,
        "description": "My Phact project",
        "autoload": {
            "psr-4": {
                "App\\": "src/backend"
            }
        },
        "license": "MIT",
        "authors": [
            {
                "name": "Your Name",
                "email": "your@email.com"
            }
        ],
        "require": {
            "php": "^8.2",
            "phact-org/phact": "^0.1.0"
        }
    };
}

function createPackageConfig(projectName) {
    return {
        "name": projectName,
        "version": "0.1.0",
        "private": true,
        "files": [
            "src/frontend"
        ],
        "scripts": {
            "build": "phact build"
        },
        "dependencies": {
            "@phact-org/phact": "^0.1.1",
            "react": "^19.1.0",
            "react-dom": "^19.1.0"
        },
        "devDependencies": {
            "@babel/cli": "^7.28.0",
            "@babel/core": "^7.28.0",
            "@babel/preset-env": "^7.28.0",
            "@babel/preset-react": "^7.27.1"
        }
    };
}

async function handler(argv) {
    const projectName = argv.name;
    const projectPath = path.resolve(process.cwd(), projectName);

    console.log(`\n${chalk.blue('-')} Creating a new Phact project in ${chalk.yellow(projectPath)}\n`);

    if (fs.existsSync(projectPath)) {
        console.error(chalk.red(`Error: Directory ${chalk.bold(projectName)} already exists.`));
        process.exit(1);
    }

    fs.mkdirSync(projectPath, {recursive: true});

    const packageJson = createPackageConfig(projectName);
    const composerJson = createComposerConfig(projectName);

    fs.writeFileSync(
        path.join(projectPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
    );

    fs.writeFileSync(
        path.join(projectPath, 'composer.json'),
        JSON.stringify(composerJson, null, 2)
    );

    const templateDir = path.join(__dirname, '..', '..', 'template');
    if (fs.existsSync(templateDir)) {
        fsExtra.copySync(templateDir, projectPath);
        console.log(`${chalk.blue('-')} Template files copied.`);
    } else {
        console.log(chalk.yellow('Warning: Template directory not found. Skipping file copy.'));
        fs.mkdirSync(path.join(projectPath, 'src', 'backend'), {recursive: true});
        fs.mkdirSync(path.join(projectPath, 'src', 'frontend'), {recursive: true});
    }

    process.chdir(projectPath);
    const spinner = ora('Installing dependencies...').start();

    try {
        spinner.text = `Installing ${chalk.bold('NPM')} dependencies...`;
        await execa('npm', ['install']);

        spinner.text = `Installing ${chalk.bold('Composer')} dependencies...`;
        await execa('composer', ['install']);

        spinner.succeed(chalk.green('Dependencies installed successfully!'));
    } catch (error) {
        spinner.fail(chalk.red('Failed to install dependencies.'));
        console.error(error.stderr || error.message);
        process.exit(1);
    }

    console.log(`\n${chalk.blue('-')} ${chalk.green.bold('Success!')} Created ${projectName} at ${projectPath}`);
    console.log('You can now get started by typing:');
    console.log(`\n  ${chalk.cyan(`cd ${projectName}`)}`);
    console.log(`  ${chalk.cyan('npm run build')}\n`);
}

export default {
    command: 'create <name>',
    describe: 'Creates a new Phact project',
    builder: (yargs) => {
        yargs.positional('name', {
            describe: 'The name of the project to create',
            type: 'string'
        });
    },
    handler: handler
};