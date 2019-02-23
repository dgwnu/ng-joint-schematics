/**
 * @dgwnu/ngschematics shape utils to create and update shape dependencies
 * 
 * Based on @angular/cli/schematics/angular/component:
 * 
 * https://github.com/angular/angular-cli/blob/master/packages/schematics/angular/component/index.ts
 */
import { join } from 'path';
import * as ts from 'typescript';
import { strings } from '@angular-devkit/core';
import {
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';

import {
  insertImport,
  findNodes,
  addImportToModule,
  addExportToModule
} from '@schematics/angular/utility/ast-utils';
import { InsertChange, Change } from '@schematics/angular/utility/change';

import { Schema } from '../../schemas/ng-joint-shape-schema';

/**
 * Constants to build Angular TS-statements
 */
const _DASH_ = '-';
const _TS_SUFFIX_ = '.ts';
const _COMPONENT_IMPORT_SUFFIX_ = '.component';
const _COMPONENT_CLASS_SUFFIX_ = 'Component';
const _MODULE_IMPORT_SUFFIX_ = '.module';
const _MODULE_CLASS_SUFFIX_ = 'Module';
const _TS_INDEX_FILE = 'index' + _TS_SUFFIX_;

/**
 * Build path where the shape type files are located
 * @param options 
 */
export function buildShapeTypePath(options: Schema): string | undefined {
    if (!options.path || !options.shapeType) {
      return undefined;
    }

    return join(options.path, strings.dasherize(options.shapeType));
  }

/**
 * Build shape type file name prefix
 * @param options
 */  
function buildShapeTypeFileNamePrefix(options: Schema): string | undefined {
  if (!options.shapesPath || !options.shapeType) {
    return undefined;
  }

  return strings.dasherize(options.shapesPath)  + _DASH_ + strings.dasherize(options.shapeType);
}

/**
 * Build shape type component file name
 * @param options
 */  
export function buildShapeTypeComponentFileName(options: Schema): string | undefined {
    const shapeTypeFileNamePrefix = buildShapeTypeFileNamePrefix(options);

    if (!shapeTypeFileNamePrefix) {
      return undefined;
    }

    return shapeTypeFileNamePrefix + _COMPONENT_IMPORT_SUFFIX_ + _TS_SUFFIX_;
}

/**
 * Build shape type module file name
 * @param options
 */  
export function buildShapeTypeModuleFileName(options: Schema): string | undefined {
  const shapeFileNamePrefix = buildShapeTypeFileNamePrefix(options);

  if (!shapeFileNamePrefix) {
    return undefined;
  }

  return shapeFileNamePrefix + _MODULE_IMPORT_SUFFIX_ + _TS_SUFFIX_;
}

/**
 * Build file path to shape type component
 * @param options 
 */
export function buildShapeTypeComponentFilePath(options: Schema): string | undefined {
    const shapeTypePath = buildShapeTypePath(options);
    const componentName = buildShapeTypeComponentFileName(options)
  
    if (!shapeTypePath || !componentName) {
      return undefined;
    }
  
    return join(shapeTypePath, componentName);
}

/**
 * Build file path to shape type component
 * @param options 
 */
export function buildShapeComponentFilePath(options: Schema): string | undefined {
  const shapeTypePath = buildShapeTypePath(options);
  const componentName = buildShapeTypeComponentFileName(options)

  if (!shapeTypePath || !componentName) {
    return undefined;
  }

  return join(shapeTypePath, componentName);
}

/**
 * Build file path to shape type module
 * @param options 
 */
export function buildShapeTypeModuleFilePath(options: Schema): string | undefined {
  const shapeTypePath = buildShapeTypePath(options);
  const moduleName = buildShapeTypeModuleFileName(options)

  if (!shapeTypePath || !moduleName) {
    return undefined;
  }

  return join(shapeTypePath, moduleName);
}

/**
 * Build file path to shape type index
 * @param options 
 */
export function buildShapeTypeIndexFilePath(options: Schema): string | undefined {
  const shapeTypePath = buildShapeTypePath(options);

  if (!shapeTypePath) {
    return undefined;
  }

  return join(shapeTypePath, _TS_INDEX_FILE);
}

function commitChanges(host: Tree, changes: Change[], path: string) {
  const recorder = host.beginUpdate(path);
  for (const change of changes) {
    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }
  }
  host.commitUpdate(recorder);  
}

/**
 * update shape references (imports, exports, @ContentChildren) in shape type files (odule and component)
 * @param options 
 */
export function updateShapeTypeComponent(options: Schema, host: Tree) {
  
  const shapeTypeComponentPath = buildShapeTypeComponentFilePath(options);
  
  if (shapeTypeComponentPath && options.shapeType) {
    // Initialize Update (shapeType).component file
    const text = host.read(shapeTypeComponentPath);
  
    if (text === null) {
      throw new SchematicsException(`File ${shapeTypeComponentPath} does not exist.`);
    }
  
    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(shapeTypeComponentPath, sourceText, ts.ScriptTarget.Latest, true);
    const shapeClass = strings.classify(options.shapeType) + strings.classify(options.name);
    const shapeClassFilePath = './' + strings.dasherize(options.name) + '/' + strings.dasherize(options.shapeType) + _DASH_ + strings.dasherize(options.name);

    // Shape Import Changes
    const shapeComponent = shapeClass + _COMPONENT_CLASS_SUFFIX_;
    const shapeComponentFilePath = shapeClassFilePath + _COMPONENT_IMPORT_SUFFIX_;
    let changes = [
      insertImport(
        source, 
        shapeTypeComponentPath, 
        shapeComponent, 
        shapeComponentFilePath
      )
    ];

    // Shape (at)ContentChildren Decorator Changes
    const classNodes = findNodes(source, ts.SyntaxKind.ClassDeclaration);
    let contentChildrenPos: number = 0;
    let isNewDecoratorString = true;
    let decoratorString = '@ContentChildren(' + shapeComponent + ')' + 
    strings.dasherize(options.shapeType) + strings.classify(options.name) + 's' +
    ': QueryList<GenericStandardElementShapeComponent>;'

    classNodes.forEach(node => node.forEachChild(child => { 
      // console.log(child.kind);
      // console.log(child.getText());
      switch (child.kind) {
        case ts.SyntaxKind.PropertyDeclaration: {
          isNewDecoratorString = (child.getText() !== decoratorString);
          if (!isNewDecoratorString) {
            contentChildrenPos = child.getStart();
            decoratorString += '\n';
          }
          break;
        }
        case ts.SyntaxKind.Constructor: {
          if (contentChildrenPos === 0) {
            contentChildrenPos = child.getStart();
            decoratorString += '\n\n';
          }
          break;
        }
      }
    }));
        
    if (isNewDecoratorString) {
      changes.push(
        new InsertChange(
          shapeTypeComponentPath,
          contentChildrenPos,
          decoratorString
        )
      );

    }

    commitChanges(host, changes, shapeTypeComponentPath);
  }

}

/**
 * update shape references (imports, exports, @ContentChildren) in shape type files (odule and component)
 * @param options 
 */
export function updateShapeTypeModule(options: Schema, host: Tree) {

  const shapeTypeModuleFilePath = buildShapeTypeModuleFilePath(options);
  
  if (shapeTypeModuleFilePath && options.shapeType) {
    // Initialize Update (shapeType).module file
    const text = host.read(shapeTypeModuleFilePath);
  
    if (text === null) {
      throw new SchematicsException(`File ${shapeTypeModuleFilePath} does not exist.`);
    }

    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(shapeTypeModuleFilePath, sourceText, ts.ScriptTarget.Latest, true);
    const shapeClass = strings.classify(options.shapeType) + strings.classify(options.name);
    const shapeClassFilePath = './' + strings.dasherize(options.name) + '/' + strings.dasherize(options.shapeType) + _DASH_ + strings.dasherize(options.name);

    // Shape NgModule Import and Export Changes
    const shapeModule = shapeClass + _MODULE_CLASS_SUFFIX_;
    const shapeModuleFilePath = shapeClassFilePath + _MODULE_IMPORT_SUFFIX_;
    let changes = 
      addImportToModule(
        source,
        shapeTypeModuleFilePath,
        shapeModule,
        shapeModuleFilePath
      );
    addExportToModule(
      source,
      shapeTypeModuleFilePath,
      shapeModule,
      shapeModuleFilePath
    ).forEach(newChange => {
      // prevent double TS-Import statement
      if (!changes.find(change => change.order === newChange.order)) {
        changes.push(newChange);
      }
    });

    commitChanges(host, changes, shapeTypeModuleFilePath);
  }

}

/**
 * update shape references (imports, exports, @ContentChildren) in shape type files (odule and component)
 * @param options 
 */
export function updateShapeTypeIndex(options: Schema, host: Tree) {

  const shapeTypeIndexFilePath = buildShapeTypeIndexFilePath(options);

  if (shapeTypeIndexFilePath && options.shapeType) {
    // Initialize Update (shapeType).index file
    const text = host.read(shapeTypeIndexFilePath);
  
    if (text === null) {
      throw new SchematicsException(`File ${shapeTypeIndexFilePath} does not exist.`);
    }

    const sourceText = text.toString('utf-8');
    const source = ts.createSourceFile(shapeTypeIndexFilePath, sourceText, ts.ScriptTarget.Latest, true);
    const exportNodes = findNodes(source, ts.SyntaxKind.ExportDeclaration);
    const shapeComponentExport = 'export * from ' + "'" +
      './' + strings.dasherize(options.name) + '/' + strings.dasherize(options.shapeType)  + 
      _DASH_ + strings.dasherize(options.name) + _COMPONENT_IMPORT_SUFFIX_ + "';";
    const exportExists = exportNodes.find(node => node.getText() === shapeComponentExport);

    if (!exportExists) {
      let changes = [
        new InsertChange(
          shapeTypeIndexFilePath, 0, shapeComponentExport + '\n'
        )
      ];
      commitChanges(host, changes, shapeTypeIndexFilePath);
    }

  }

}