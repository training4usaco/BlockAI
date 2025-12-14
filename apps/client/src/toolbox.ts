import * as Blockly from "blockly/core";

export const toolbox: Blockly.utils.toolbox.ToolboxDefinition = {
    kind: 'categoryToolbox',
    contents: [
        {
            kind: 'category',
            name: 'Layers',
            colour: '#5b80a5',
            contents: [
                { kind: 'block', type: 'linear' },
                { kind: 'block', type: 'batchNorm1d' },
            ],
        },
        {
            kind: 'category',
            name: 'Activations',
            colour: '#5cb85c',
            contents: [
                { kind: 'block', type: 'relu' },
                { kind: 'block', type: 'tanh' },
            ],
        },
        {
            kind: 'category',
            name: 'Model',
            colour: '#0bd592',
            contents: [
                { kind: 'block', type: 'sequential' },
            ]
        },
        
        { kind: 'sep' },
        
        {
            kind: 'category',
            name: 'Variables',
            colour: '#A65C81',
            custom: 'VARIABLE',
        },
        {
            kind: 'category',
            colour: '#995ba5',
            name: 'Functions',
            custom: 'PROCEDURE',
        }
    ],
};