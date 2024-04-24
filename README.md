# Blip Ditto Import

This package is a tool to sync with Dittowords dictionaries.

## Installation

This package is meant to be used with **npx** command, which by default, will ask you to install it to your user context on the first run.

If you prefer to have the package inside your project's node_modules you can execute the following:

```
npm i -D blip-ditto-import
```

## Usage


### Environment Variable

Before invoke the sync method you need to set DITTO_API_KEY environment variable with your KEY.

### Base Configuration File

Create a file called **ditto-import-conf.json** in the source of your project with this basic structure:

```json
{
    "base_variant": "pt",
    "projects": []
}
```

*Change the value of your default language variant in the **base_variant** property if **pt** does not suit you.*

### Project Configurations

For each ditto project you want to sync you need to add an entry inside the **projects** array like this:

```json
{
    "base_variant": "pt",
    "projects": [
        {
            "id": "6317d22cedb4909dd689f39f",
            "name": "a-ditto-project",
            "destination": "output/dictionary.ts"
        }
    ]
}
```

#### Properties

- **id**: 
This id can be found in your projects URL. (eg: ht<span>tps://</span>app.dittowords.com/projects/**6317d22cedb4909dd689f39f**/page/0:1)

- **name**: A human readable identifier. It's used to name the output file if not defined in destination field and to sync a specific project through command options.

- **destination**: The output path for the generated file(s).
    - You can use the **__variant** replacer to break the output into subfolders or multiple files.
    ```json
    {
        "id": "6317d22cedb4909dd689f39f",
        "name": "a-ditto-project",
        "destination": "output/__variant/i18n.ts"
    }
    ```

#### Outputs

You can choose between **.json** and **.ts** files.

*If you choose **.ts** files the script will perform an TypeScript transpile and message you if the output is not valid.*

### Executing

In order to perform a sync you can run the following command:

```
npx blip-ditto-import
```

The script will generate files for all projects in your config file. If you want to sync a single project you can specify the project's name as an argument like this:

```
npx blip-ditto-import project=a-ditto-project
```

#### NPM Scripts Shortcut

If you find more suitable you can add an npm script in your **package.json** file to create an alias to the executing command:

```json
"scripts": {
    "ditto:pull": "npx blip-ditto-import"
}
```

Then you can run it like this:

```
npm run ditto:pull
```

### Dittowords TLS problem

Some of you may face a certificate problem when running this script against Ditto API. In order to fix it you have to set the **NODE_TLS_REJECT_UNAUTHORIZED** environment variable to **0**.

Because this is highly not recommended, you can set it just for this command execution in particular.

A cross OS solution is:

- Add **cross-env** package to your project:
    
    ```
    npm i -D cross-env
    ```

-  Create a npm script in your **package.json**:

    ```json
    "scripts": {
        "ditto:pull": "npx blip-ditto-import",
        "ditto:pull-no-tls": "cross-env NODE_TLS_REJECT_UNAUTHORIZED=0 npx blip-ditto-import"
    }
    ```

- Then execute your new script:

    ```
    npm run ditto:pull-no-tls
    ```
