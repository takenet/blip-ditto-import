#!/usr/bin/env node
const { existsSync, mkdirSync, writeFileSync } = require('fs');
const ts = require('typescript');
const config = require(`${process.cwd()}/ditto-import-conf.json`);

const VARIANT_KEY = '__variant';

const API_KEY_VARIABLE = 'DITTO_API_KEY';
const API_KEY = process.env[API_KEY_VARIABLE];

if (!API_KEY) {
    console.log(`${API_KEY_VARIABLE} variable not found! Please set it before importing.`);
    return;
}

const setPathValue = (obj, path, value) => {
    const splitted = path.split('.');
    for (let i = 0; i < splitted.length; i++) {
        let k = splitted[i];

        if (i == splitted.length -1)
            obj[k] = value;
        else {
            if (!obj.hasOwnProperty(k))
                obj[k] = {};

            obj = obj[k];
        }
    }
};

const importProject = async (id) => {
    const response = await fetch(`https://api.dittowords.com/v1/projects/${id}?format=structured`, {
        headers: {
            'Authorization': API_KEY
        }
    });

    const projectKeys = await response.json();
    const translations = {};
    
    Object.keys(projectKeys).forEach(key => {
        const projectKey = projectKeys[key];
        setPathValue(translations, `${config.base_variant}.${key}`, projectKey.text);
        
        if (!projectKey.variants) return;
        
        Object.keys(projectKey.variants).map(variant => {
            setPathValue(translations, `${variant}.${key}`, projectKey.variants[variant].text);
        });
    });

    return translations;
};

const writeOut = async (project, translations, variant) => {
    let fileContent = JSON.stringify(translations, null, 4);

    if (!project.destination)
        project.destination = `${project.name || project.id}.json`;

    if (project.destination.includes('.ts')) {
        fileContent = `export const translations = ${fileContent.replace(/"([^"]+)":/g, '$1:')};`;

        const errors = [];
        ts.transpile(fileContent, {}, undefined, errors);
        
        if (errors.length) {
            console.log(`The TypeScript output file for project ${project.name || project.id} could not be generated properly!`);
            return;
        }
    }

    let filePath = project.destination;
    
    if (variant)
        filePath =  project.destination.replace(VARIANT_KEY, variant);

    const fullPath = `${process.cwd()}/${filePath}`;
    const directory = fullPath.replace(/[\/\\][^\/\\]+[\/\\]?$/, '');

    if (!existsSync(directory)) mkdirSync(directory, { recursive: true });

    writeFileSync(fullPath, fileContent); 
};

const run = async () => {
    let projects = config.projects;

    const projectArgFull = process.argv.find(a => a.includes('project'));
    const projectArg = projectArgFull && projectArgFull.split('=')[1];

    if (projectArg) {
        const project = config.projects.find(p => p.id == projectArg || p.name == projectArg);

        if (!project) {
            console.log(`No configuration for project ${projectArg} was found!`);
            return;
        }
        
        projects = [project];
    }

    for (let project of projects) {
        const translations = await importProject(project.id);

        if (project.destination.includes(VARIANT_KEY)) {
            for (let variant in translations)
                await writeOut(project, translations[variant], variant);
        }
        else
            await writeOut(project, translations);
    }
};

run().then(() => console.log('Done!'));