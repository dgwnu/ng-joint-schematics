import { resolve, sep } from 'path';
import { readFileSync } from 'fs';

import { SchematicsException } from '@angular-devkit/schematics';

/**
 * Read Ng Joint Schematics File defined in options and return JSON Data 
 * @param options 
 */
export function getSchematicsData(
    options: NgJointSchematicDataOptions
    ): NgJointSchematicData {

    if (!options.path) {
        throw new SchematicsException('getSchematicsData() Option (path) is required.');
    }

    if (options.schematicsDataFile === '' || options.schematicsDataFile === undefined) {
        options.schematicsDataFile = '.' + sep + resolve(options.path, '..', 'ng-joint-schematics-data.json');
    }

    const data = readFileSync(options.schematicsDataFile, 'utf-8');
    return JSON.parse(data);

}

/**
 * Get the Data for the Ng Joint Shape Type (standard, uml, angular, ...)
 * @param options
 */
export function getShapeType( 
    options: NgJointSchematicDataOptions): NgJointShapeType {

    if (!options.shapeType) {
            throw new SchematicsException('getShapeType() Option (shapeType) is required.');
    }

    return getSchematicsData(options).shapes[options.shapeType];
}

/**
 * Get the Elements for the Shape Type (standard, uml, angular, ...)
 * @param options 
 */
export function getShapeTypeElements(
    options: NgJointSchematicDataOptions): NgJointShape | undefined {
    return getShapeType(options).elements;
}

/**
 * Get Input Properties for Element (Reactangle, ....)
 * @param options 
 * @param shapeType 
 * @param element 
 */
export function getShapeProperties(
    options: NgJointSchematicDataOptions): NgJointShapeProperties | undefined {
        
    if (!options.name) {
        throw new SchematicsException('getShapeProperties() Option (name) is required.');
    }

    const shapeTypeElements = getShapeTypeElements(options);

    if (shapeTypeElements) {
        return shapeTypeElements[options.name].properties;
    }

    return undefined;
}


export interface NgJointSchematicDataOptions { 
    path?: string,
    schematicsDataFile?: string
    name?: string;
    shapeType?: string;
}

export interface NgJointSchematicData {
    shapes: NgJointShapeTypes;
}

export interface NgJointShapeTypes {
    [shapeType: string]: NgJointShapeType;
}

export interface NgJointShapeType {
    generic?: NgJointShape;
    elements?: NgJointShape;
    links?: NgJointShape;
}

export interface NgJointShape {
    [shapeName: string]: {
        properties: NgJointShapeProperties;
    };
}

export interface NgJointShapeProperties {
    attrs: {
        [propName: string]: string;
    };
}