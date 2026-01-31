import * as Blockly from "blockly/core";
import {COLORS} from "./config/colors.ts";

export const toolbox: Blockly.utils.toolbox.ToolboxDefinition = {
    kind: 'categoryToolbox',
    contents: [
        {
            kind: 'category',
            name: 'Inputs',
            colour: COLORS.INPUT,
            contents: [
                { kind: 'block', type: 'lsv_input' },
            ]
        },

        {
            kind: 'category',
            name: 'Data Processing',
            colour: COLORS.DATA_PROCESSING,
            contents: [
                { kind: 'block', type: 'build_tokenizer' },
                { 
                    kind: 'block', 
                    type: 'build_dataset',
                    inputs: {
                        BLOCK_SIZE: {
                            shadow: {
                                type: "math_number",
                                fields: {
                                    NUM: 3,
                                }
                            }
                        },
                    }
                },
                { kind: 'block', type: 'split_dataset' },
            ]
        },

        { kind: 'sep' },

        {
            kind: 'category',
            name: 'Layers',
            colour: COLORS.LAYERS,
            contents: [
                { kind: 'block', type: 'linear' },
                { kind: 'block', type: 'batch_norm_1d' },
            ],
        },
        {
            kind: 'category',
            name: 'Activations',
            colour: COLORS.ACTIVATIONS,
            contents: [
                { kind: 'block', type: 'relu' },
                { kind: 'block', type: 'tanh' },
            ],
        },
        {
            kind: 'category',
            name: 'Model',
            colour: COLORS.MODEL,
            contents: [
                {
                    kind: 'block',
                    type: 'sequential',
                    inputs: {
                        BLOCK_SIZE: {
                            shadow: {
                                type: "math_number",
                                fields: {
                                    NUM: 3,
                                }
                            }
                        },
                        REPS: {
                            shadow: {
                                type: "math_number",
                                fields: {
                                    NUM: 4,
                                }
                            }
                        },
                        NUM_HIDDEN: {
                            shadow: {
                                type: "math_number",
                                fields: {
                                    NUM: 200,
                                }
                            }
                        },
                        EMB_DIM: {
                            shadow: {
                                type: "math_number",
                                fields: {
                                    NUM: 10,
                                }
                            }
                        }
                    },
                },
            ]
        },

        { kind: 'sep' },

        {
            kind: 'category',
            name: 'Initialize Parameters',
            colour: COLORS.PARAM_INITIALIZATION,
            contents: [
                { kind: 'block', type: 'no_grad' },
                { kind: 'block', type: 'kaiming_normalize' },
                { 
                    kind: 'block', 
                    type: 'squash_logits',
                    inputs: {
                        SCALE: {
                            shadow: {
                                type: "math_number",
                                fields: {
                                    NUM: 0.1
                                }
                            }
                        }
                    }
                },
            ]
        },

        { kind: 'sep' },

        {
            kind: 'category',
            name: 'Training',
            colour: COLORS.TRAINING,
            contents: [
                {
                    kind: 'block',
                    type: 'training_loop',
                    inputs: {
                        STEPS: {
                            shadow: {
                                type: "math_number",
                                fields: { 
                                    NUM: 200000 
                                }
                            }
                        },
                        BATCH_SIZE: {
                            shadow: {
                                type: "math_number",
                                fields: { 
                                    NUM: 32 
                                }
                            }
                        },
                        LR_MAX: {
                            shadow: {
                                type: "math_number",
                                fields: { 
                                    NUM: 0.08 
                                }
                            }
                        },
                    }
                }
            ]
        },

        { kind: 'sep' },

        { 
            kind: 'category',
            name: 'Evaluation',
            colour: COLORS.EVALUATION,
            contents: [
                { 
                    kind: 'block', 
                    type: 'generate_inference',
                    inputs: {
                        NUM_SAMPLES: {
                            shadow: {
                                type: "math_number",
                                fields: {
                                    NUM: 20
                                }
                            }
                        },
                    }
                },
                { kind: 'block', type: 'calculate_loss' }
            ]
        },

        {
            kind: 'category',
            name: 'Visualization',
            colour: COLORS.VISUALIZATION,
            contents: [
                { kind: 'block', type: 'loss_graph' }
            ]
        },
        
        { kind: 'sep' },
        
        {
            kind: 'category',
            name: 'Loops',
            colour: COLORS.LOOPS,
            contents: [
                {
                    kind: 'block',
                    type: 'controls_repeat_ext',
                    inputs: {
                        TIMES: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 10 },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'controls_whileUntil',
                },
                {
                    kind: 'block',
                    type: 'controls_for',
                    inputs: {
                        FROM: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 1 },
                            },
                        },
                        TO: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 10 },
                            },
                        },
                        BY: {
                            shadow: {
                                type: 'math_number',
                                fields: { NUM: 1 },
                            },
                        },
                    },
                },
                {
                    kind: 'block',
                    type: 'controls_forEach',
                },
                {
                    kind: 'block',
                    type: 'controls_flow_statements',
                },
            ],
        },
        
        {
            kind: 'category',
            name: 'Logic',
            colour: COLORS.LOGIC,
            contents: [
                { kind: 'block', type: 'logic_compare' },
                { kind: 'block', type: 'logic_operation' },
                { kind: 'block', type: 'logic_boolean' }
            ]
        },
        
        {
            kind: 'category',
            name: 'Math',
            colour: COLORS.MATH,
            contents: [
                { kind: 'block', type: 'math_number' },
                { kind: 'block', type: 'math_arithmetic' }
            ]
        },

        {
            kind: 'category',
            name: 'Text',
            colour: COLORS.TEXT,
            contents: [
                { kind: 'block', type: 'text' },
                { kind: 'block', type: 'text_join' },
                { kind: 'block', type: 'text_length' },
                { kind: 'block', type: 'text_print' },
                { kind: 'block', type: 'special_character' }
            ],
        },

        {
            kind: 'category',
            name: 'Lists',
            colour: COLORS.LISTS,
            contents: [
                { kind: 'block', type: 'lists_create_with' },
                { kind: 'block', type: 'lists_repeat' },
                { kind: 'block', type: 'lists_length' },
                { kind: 'block', type: 'lists_isEmpty' },
                { kind: 'block', type: 'lists_indexOf' },
                { kind: 'block', type: 'lists_getIndex' },
                { kind: 'block', type: 'lists_setIndex' },
                { kind: 'block', type: 'lists_getSublist' },
                { kind: 'block', type: 'lists_split' },
                { kind: 'block', type: 'lists_sort' }
            ]
        },

        { kind: 'sep' },
        
        {
            kind: 'category',
            name: 'Variables',
            colour: COLORS.VARIABLES,
            custom: 'VARIABLE',
        },
        {
            kind: 'category',
            colour: COLORS.FUNCTIONS,
            name: 'Functions',
            custom: 'PROCEDURE',
        },

        { kind: 'sep' },

        {
            kind: 'category',
            colour: COLORS.CUSTOM_CODE,
            name: 'Custom Code',
            contents: [
                { kind: 'block', type: 'custom_code' } 
            ]
        }

    ],
};