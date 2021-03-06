/**
 * @dgwnu/joint-schematics data handling functions
 * 
 * Format JSON Escapes @see {https://www.freeformatter.com/json-escape.html}
 */

// Node Imports
import { readFileSync } from 'fs';

// Angular Imports
import { SchematicsException } from '@angular-devkit/schematics';

// Dgwnu Imports
import { NgJointSchematicDataOptions } from './ng-joint-schematic-data-options';
import { 
    NgJointSchematicDataSchema,
    NgJointDefaults,
    NgJointShapeType,
    NgJointShapeTypeDefaults,
    NgJointShape,
    NgJointShapeProperties
} from './ng-joint-schematic-data-schema';

/**
 * Read Ng Joint Schematics File defined in options and return JSON Data 
 * @param options 
 */
export function getSchematicsData(
    options: NgJointSchematicDataOptions
    ): NgJointSchematicDataSchema {

    if (!options.schematicsDataFile) {
        throw new SchematicsException('Option (schematicsDataFile) is required.');
    }

    const data = readFileSync(options.schematicsDataFile, 'utf-8');
    
    return JSON.parse(data);
}

/**
 * Get the Data for the Ng Joint Defaults (imports-mapping etc.)
 * @param options
 */
export function getDefaults( 
    options: NgJointSchematicDataOptions): NgJointDefaults {

    return getSchematicsData(options).defaults;
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
 * Get the Defaults for the Shape Type (standard, uml, angular, ...)
 * @param options 
 */
export function getShapeTypeDefaults(
    options: NgJointSchematicDataOptions): NgJointShapeTypeDefaults | undefined {
    return getShapeType(options).defaults;
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
 * Get the Elements for the Shape Type (standard, uml, angular, ...)
 * @param options 
 */
export function getShapeTypeLinks(
    options: NgJointSchematicDataOptions): NgJointShape | undefined {
    return getShapeType(options).links;
}

/**
 * Get Input Properties for a specific Element (Reactangle, ....)
 * @param options 
 */
export function getElementProperties(
    options: NgJointSchematicDataOptions): NgJointShapeProperties | undefined {
        
    if (!options.name) {
        throw new SchematicsException('getElementProperties() Option (name) is required.');
    }

    const shapeTypeElements = getShapeTypeElements(options);

    if (shapeTypeElements) {
        // shapetype has elements
        if (shapeTypeElements[options.name]) {
            // element is defined
            return shapeTypeElements[options.name].properties;
        }
    }

    // no element defined
    return undefined;
}

/**
 * Get Input Properties for a specific Link (Link, DoubleLink, ....)
 * @param options 
 */
export function getLinkProperties(
    options: NgJointSchematicDataOptions): NgJointShapeProperties | undefined {
        
    if (!options.name) {
        throw new SchematicsException('getLinkProperties() Option (name) is required.');
    }

    const shapeTypeLinks = getShapeTypeLinks(options);

    if (shapeTypeLinks) {
        // shapetype has elements
        if (shapeTypeLinks[options.name]) {
            // element is defined
            return shapeTypeLinks[options.name].properties;
        }
    }

    // no link defined
    return undefined;
}

/**
 * Get Angular Component HTML-template for a specific Element (Angular, ....)
 * @param options 
 */
export function getElementTemplate(
    options: NgJointSchematicDataOptions): string | undefined {
        
    if (!options.name) {
        throw new SchematicsException('getElementTemplate() Option (name) is required.');
    }

    const shapeTypeElements = getShapeTypeElements(options);

    if (shapeTypeElements) {
        // shapetype has elements
        if (shapeTypeElements[options.name]) {
            // element is defined
            return shapeTypeElements[options.name].template;
        }
    }

    // no element defined
    return undefined;
}

/**
 * Get Angular Component HTML-template for a specific Link (Angular, ....)
 * @param options 
 */
export function getLinkTemplate(
    options: NgJointSchematicDataOptions): string | undefined {
        
    if (!options.name) {
        throw new SchematicsException('getLinkTemplate() Option (name) is required.');
    }

    const shapeTypeLinks = getShapeTypeLinks(options);

    if (shapeTypeLinks) {
        // shapetype has links
        if (shapeTypeLinks[options.name]) {
            // link is defined
            return shapeTypeLinks[options.name].template;
        }
    }

    // no link defined
    return undefined;
}

/**
 * Get Angular Component Style for a specific Element (Angular, ....)
 * @param options 
 */
export function getElementStyle(
    options: NgJointSchematicDataOptions): string | undefined {
        
    if (!options.name) {
        throw new SchematicsException('getElementStyle() Option (name) is required.');
    }

    const shapeTypeElements = getShapeTypeElements(options);

    if (shapeTypeElements) {
        // shapetype has elements
        if (shapeTypeElements[options.name]) {
            // element is defined
            return shapeTypeElements[options.name].style;
        }
    }

    // no element defined
    return undefined;
}

/**
 * Get Angular Component Style for a specific Link (Angular, ....)
 * @param options 
 */
export function getLinkStyle(
    options: NgJointSchematicDataOptions): string | undefined {
        
    if (!options.name) {
        throw new SchematicsException('getLinkStyle() Option (name) is required.');
    }

    const shapeTypeLinks = getShapeTypeLinks(options);

    if (shapeTypeLinks) {
        // shapetype has links
        if (shapeTypeLinks[options.name]) {
            // link is defined
            return shapeTypeLinks[options.name].style;
        }
    }

    // no link defined
    return undefined;
}

export * from './ng-joint-schematic-data-schema';