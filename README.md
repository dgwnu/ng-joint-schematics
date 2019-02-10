# Getting Started With Schematics

This repository is a basic Schematic implementation that serves as a starting point to create and publish Schematics to NPM.

### Testing

To test locally, install `@angular-devkit/schematics-cli` globally and use the `schematics` command line tool. That tool acts the same as the `generate` command of the Angular CLI, but also has a debug mode.

Check the documentation with
```bash
schematics --help
```

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

### Helpfull Links

* intro https://blog.angular.io/schematics-an-introduction-dc1dfbc2a2b2
* schematic context https://stackoverflow.com/questions/54406061/classoptions-schema-angular-schematics
* add to angular cli https://blog.angularindepth.com/creating-your-own-application-template-for-angular-cli-95e22319cc24