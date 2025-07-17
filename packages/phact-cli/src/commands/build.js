import fs from 'fs';
import path from 'path';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {parse} from '@babel/parser';
import traverse from '@babel/traverse';
import register from '@babel/register';
import fsExtra from 'fs-extra';
import esbuild from 'esbuild';
import chalk from 'chalk';
import ora from 'ora';
import {Document} from 'phact/document';


const normalizePath = (filePath) => filePath.replace(/\\/g, '/');

async function handler(argv) {
    console.log(chalk.cyan('Starting Phact build process...'));

    register({
        presets: [
            '@babel/preset-env',
            ['@babel/preset-react', {runtime: 'automatic'}]
        ],
        extensions: ['.js', '.jsx'],
        cache: true,
    });

    const phactConfigPath = path.join(process.cwd(), 'phact.config.json');
    let phactConfig;
    try {
        const phactConfigString = fs.readFileSync(phactConfigPath, 'utf-8');
        phactConfig = JSON.parse(phactConfigString);
    } catch (error) {
        console.error(`\n${chalk.red.bold('Error:')} Failed to load or parse ${chalk.yellow('phact.config.json')}.`);
        console.error(chalk.gray(error.message));
        process.exit(1);
    }

    const pagesPath = path.join(process.cwd(), phactConfig["pages"]);
    if (!fs.existsSync(pagesPath)) {
        console.error(`\n${chalk.red.bold('Error:')} The pages directory was not found.`);
        console.error(`  > Expected at: ${chalk.yellow(pagesPath)}`);
        process.exit(1);
    }

    const outputDir = path.join(process.cwd(), 'dist');
    fsExtra.removeSync(outputDir);
    fs.mkdirSync(outputDir, {recursive: true});
    console.log(`Build directory ${chalk.yellow('dist/')} cleaned.`);

    const pages = fs.readdirSync(pagesPath).filter(page => fs.statSync(path.join(pagesPath, page)).isFile());
    const buildSpinner = ora(`Found ${pages.length} pages to build. Starting...`).start();

    for (const pageFile of pages) {
        const fullPath = path.join(pagesPath, pageFile);
        const ext = path.extname(pageFile);
        if (!['.js', '.jsx'].includes(ext)) continue;

        const pageName = path.basename(pageFile, ext);
        buildSpinner.text = `Building page: ${chalk.cyan(pageName)}`;

        try {
            const requirePath = normalizePath(fullPath);
            delete require.cache[require.resolve(requirePath)];
            const PageComponent = require(requirePath).default;

            if (!PageComponent) {
                buildSpinner.warn(chalk.yellow(`No default export in ${chalk.cyan(pageFile)}. Skipping.`));
                continue;
            }

            const jsxPropsTree = extractJsxPropsTree(fullPath);
            const appElement = <PageComponent props={jsxPropsTree}/>;

            let documentHtml = renderToString(
                <Document pageName={pageName} AppContents={appElement}/>
            );

            documentHtml = documentHtml.replace(/__PHACT_PLACEHOLDER_(.+?)__/g, (match, base64) => {
                const json = Buffer.from(base64, 'base64').toString('utf8');
                const parts = JSON.parse(json);
                return `<?php echo $props${parts.map(p => `["${p}"]`).join('')}; ?>`;
            });

            const finalPhpContent = `<?php function ${pageName.toUpperCase()}($props){ ?>${documentHtml}<?php } ?>`;
            const outPath = path.join(outputDir, `${pageName.toUpperCase()}.php`);
            fs.writeFileSync(outPath, finalPhpContent);

            const clientEntryContent = `
                import PageComponent from '${requirePath}';
                import { hydrate } from '${normalizePath(path.join(pagesPath, '../index.js'))}';
                
                hydrate(PageComponent);
            `;

            await esbuild.build({
                stdin: {
                    contents: clientEntryContent,
                    resolveDir: process.cwd(),
                    sourcefile: 'client-entry.js'
                },
                bundle: true,
                outfile: path.join(outputDir, `${pageName}.js`),
                platform: 'browser',
                format: 'iife',
                loader: {'.js': 'jsx'},
                sourcemap: true,
            });

        } catch (error) {
            buildSpinner.fail(chalk.red(`Failed to build page ${chalk.cyan(pageFile)}.`));
            console.error(chalk.gray(error.stack || error.message));
        }
    }

    buildSpinner.succeed(chalk.green.bold('Build completed successfully!'));
    console.log(`\nOutput files are in the ${chalk.yellow('dist/')} directory.`);
}

function extractJsxPropsTree(file) {
    const content = fs.readFileSync(file, 'utf8');
    const ast = parse(content, {
        sourceType: 'module',
        plugins: ['jsx']
    });

    const output = {};

    traverse(ast, {
        JSXExpressionContainer(astPath) {
            const expr = astPath.node.expression;

            if (expr.type === 'MemberExpression') {
                const parts = [];
                let current = expr;
                while (current.type === 'MemberExpression') {
                    if (current.property.type === 'Identifier') {
                        parts.unshift(current.property.name);
                    }
                    current = current.object;
                }

                if (current.type === 'Identifier' && current.name === 'props') {
                    let ref = output;
                    for (let i = 0; i < parts.length; i++) {
                        const key = parts[i];
                        if (i === parts.length - 1) {
                            ref[key] = '__PHACT_PLACEHOLDER_' + Buffer.from(JSON.stringify(parts)).toString('base64') + '__';
                        } else {
                            ref[key] = ref[key] || {};
                            ref = ref[key];
                        }
                    }
                }
            }
        }
    });

    return output;
}

export default {
    command: 'build',
    describe: 'Builds the Phact app for production',
    handler: handler
};
