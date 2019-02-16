import { join } from 'path';
import * as ts from 'typescript';
import { strings } from '@angular-devkit/core';
import {
  Rule,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';

import { insertImport } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';

interface ShapeOptions {
    name: string;
    shapeType?: string;
    path?: string;
}

export function buildShapeTypePath(options: ShapeOptions): string | undefined {
    if (!options.path || !options.shapeType) {
      return undefined;
    }

    return join(options.path, strings.dasherize(options.shapeType));
  }
  
  export function buildShapeTypeComponentName(options: ShapeOptions): string | undefined {
    if (!options.shapeType) {
      return undefined;
    }

    return 'shape-' + strings.dasherize(options.shapeType) + '.component.ts';
  }
  
  export function buildShapeTypeComponentPath(options: ShapeOptions): string | undefined {
    const shapeTypePath = buildShapeTypePath(options);
    const componentName = buildShapeTypeComponentName(options)
  
    if (!shapeTypePath || !componentName) {
      return undefined;
    }
  
    return join(shapeTypePath, componentName);
  }
  
  export function updateShapeReferences(options: ShapeOptions): Rule {
    return (host: Tree) => {
  
      const shapeTypeComponentPath = buildShapeTypeComponentPath(options);
  
      if (shapeTypeComponentPath && options.shapeType) {
        const text = host.read(shapeTypeComponentPath);
  
        if (text === null) {
          throw new SchematicsException(`File ${shapeTypeComponentPath} does not exist.`);
        }
  
        const sourceText = text.toString('utf-8');
        const source = ts.createSourceFile(shapeTypeComponentPath, sourceText, ts.ScriptTarget.Latest, true);
        const change = insertImport(
          source, 
          shapeTypeComponentPath, 
          strings.classify(options.shapeType) + strings.classify(options.name), 
          './' + strings.dasherize(options.name) + '/' +
          strings.dasherize(options.shapeType) + '-' + strings.dasherize(options.name));
  
        const recorder = host.beginUpdate(shapeTypeComponentPath);
        if (change instanceof InsertChange) {
          recorder.insertLeft(change.pos, change.toAdd);
        }
        host.commitUpdate(recorder);
      }
    }
  }
  