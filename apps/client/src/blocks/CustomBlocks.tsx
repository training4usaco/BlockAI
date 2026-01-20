import * as Blockly from 'blockly/core';
import { pythonGenerator } from 'blockly/python';
import { FieldMultilineInput } from '@blockly/field-multilineinput';
import { FieldFilePicker } from '../fields/FieldFilePicker';
import {CharTokenizer} from "../python-library/CharTokenizer.ts";
import {Linear} from "../python-library/Linear.ts";
import {BatchNorm1d} from "../python-library/BatchNorm1d.ts";
import {Tanh} from "../python-library/activations/Tanh.ts";
import {ReLU} from "../python-library/activations/ReLU.ts";
import {SplitDataset} from "../python-library/SplitDataset.ts";
import {LSVInput} from "../python-library/input/LSVInput.ts";
import {KNOWN_ACTIVATIONS} from "./BlockRegistry.ts";
import {KaimingNormalization} from "../python-library/KaimingNormalization.ts";
import {InitializeParameters} from "../python-library/InitializeParameters.ts";

function getUniqueName(workspace: Blockly.Workspace, prefix: string) {
  let candidate = prefix;
  let counter = 2;

  while (true) {
    let isTaken = false;
    
    const allBlocks = workspace.getAllBlocks(false);
    for (const block of allBlocks) {
      if (block.data === candidate) {
        isTaken = true;
        break;
      }
    }

    if (!isTaken) {
      return candidate; 
    }

    candidate = prefix + '_' + counter;
    counter++;
  }
}

Blockly.Blocks['linear'] = {
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField('Linear Layer');
    this.setColour('#4DB6AC');
    this.setTooltip('Applies a linear transformation: y = xW^T + b');
  }
};

Blockly.Blocks['batch_norm_1d'] = {
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField('BatchNorm1d');
    this.setColour('#4DB6AC');
  }
};

Blockly.Blocks['sequential'] = {
  init: function() {
    this.setColour('#78909C');
    
    this.appendDummyInput().appendField('Sequential Model');

    this.appendValueInput('BLOCK_SIZE')
        .setCheck('Number')
        .appendField('context length');
    
    this.appendValueInput('REPS')
        .setCheck('Number')
        .appendField('number of repetitions')
    
    this.appendValueInput('NUM_HIDDEN')
        .setCheck('Number')
        .appendField('number of hidden layer nodes');
    
    this.appendValueInput('EMB_DIM')
        .setCheck('Number')
        .appendField('embedding dimension');
    
    this.appendValueInput("TOKENIZER")
        .appendField("tokenizer");
    
    this.appendStatementInput('LAYERS')
        .setCheck(['Layers', 'Activations'])
        .appendField('layers');

    this.setPreviousStatement(true);
    this.setNextStatement(true); 
    this.setOutput(false);

    this.setTooltip('A container that stacks layers sequentially.');
  },

  onchange: function(event: any) {
    if (!this.workspace || this.workspace.isFlyout) return;

    if (event.type === Blockly.Events.BLOCK_CREATE && event.blockId === this.id) {
      if(!this.data) {
        this.data = getUniqueName(this.workspace, "sequential_model");
        this.workspace.createVariable(this.data);
      }
    }
  }
};

Blockly.Blocks['tanh'] = {
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField('Tanh');
    this.setColour( '#80CBC4');
  }
};

Blockly.Blocks['relu'] = {
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField('ReLU');
    this.setColour('#80CBC4');
  }
};

Blockly.Blocks['lsv_input'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('Load data from LSV file')
    this.appendDummyInput()
        .appendField(new FieldFilePicker("click_to_select_lsv.txt"), 'FILENAME');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#FF8A65');
  },

  onchange: function(event: any) {
    if (!this.workspace || this.workspace.isFlyout) return;

    if (event.type === Blockly.Events.BLOCK_CREATE && event.blockId === this.id) {
      if(!this.data) {
        this.data = getUniqueName(this.workspace, "lsv_input");
        this.workspace.createVariable(this.data);
      }
    }
  }
}

Blockly.Blocks['special_character'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("special char")
        .appendField(new Blockly.FieldDropdown([
          ["Line Feed (\\n)", "\\n"],
          ["Carriage Return (\\r)", "\\r"],
          ["Newline (\\r\\n)", "\\r\\n"],
          ["Tab (\\t)", "\\t"],
          ["Space ( )", " "],
          ["Comma (,)", ","],
        ]), "CHAR");

    this.setOutput(true, "String");
    this.setColour('#5CA68D');
    this.setTooltip("Returns a special character for text splitting.");
  }
};

Blockly.Blocks['custom_code'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('Custom Code');
    
    const codeField = new FieldMultilineInput("print('Write code here')");

    this.appendDummyInput()
        .appendField(codeField, 'CUSTOM_CODE');
    this.setColour('#555555');
  }
};

Blockly.Blocks['build_tokenizer'] = {
  init: function() {
    this.setInputsInline(true);
    this.appendValueInput("DATA")
        .setCheck("Array") 
        .appendField("build tokenizer from data");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#FFB74D');
    this.setTooltip("Creates a Character Tokenizer object.");
  },

  onchange: function(event: any) {
    if (!this.workspace || this.workspace.isFlyout) return;

    if (event.type === Blockly.Events.BLOCK_CREATE && event.blockId === this.id) {
      if(!this.data) {
        this.data = getUniqueName(this.workspace, "tokenizer");
        this.workspace.createVariable(this.data);
      }
    }
  }
};

Blockly.Blocks['build_dataset'] = {
  init: function() {
    this.setInputsInline(true);

    this.appendValueInput("TOKENIZER")
        .appendField("build window dataset using tokenizer");

    this.appendValueInput("BLOCK_SIZE")
        .appendField("and context length");

    this.setOutput(true, "Array");
    this.setColour('#FFB74D');
    this.setTooltip("Converts text to numbers and creates sliding window (X, Y) tensors.");
  }
};

Blockly.Blocks['split_dataset'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Split Dataset");
    this.appendValueInput("DATASET").setCheck(null);

    const nameField = new Blockly.FieldTextInput("data");

    nameField.setValidator(this.validator);

    this.appendDummyInput()
        .appendField("variable name")
        .appendField(nameField, "BASE_NAME");

    this.appendDummyInput()
        .appendField("train split (%)")
        .appendField(new Blockly.FieldNumber(80, 0, 100), "TRAIN_SPLIT");

    this.appendDummyInput()
        .appendField("dev split (%)")
        .appendField(new Blockly.FieldNumber(10, 0, 100), "DEV_SPLIT");

    this.appendDummyInput()
        .appendField("test split (%)")
        .appendField("10", "TEST_SPLIT") 

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour('#FFB74D');
  },

  onchange: function(event: any) {
    if (!this.workspace || this.workspace.isFlyout) return;

    if (event.type === Blockly.Events.BLOCK_CREATE && event.blockId === this.id) {
      const currentName = this.getFieldValue('BASE_NAME');
      this.ensureVariables(currentName);
    }
    
    if (event.type === Blockly.Events.BLOCK_CHANGE && event.blockId === this.id) {
      const train = this.getFieldValue('TRAIN_SPLIT');
      const dev = this.getFieldValue('DEV_SPLIT');

      let test = 100 - train - dev;
      if (test < 0) test = 0;

      const field = this.getField('TEST_SPLIT');
      if (field) field.setValue(String(test));
    }
  },

  ensureVariables: function(base_name: string) {
    const suffixes = ['_train', '_dev', '_test'];
    suffixes.forEach(suffix => {
      const varName = base_name + suffix;
      this.workspace.createVariable(varName);
    });
  },

  validator: function(newVarName: string) {
    const block = this.getSourceBlock();
    const workspace = block.workspace;

    const oldName = this.getValue(); 
    if (newVarName === oldName) return newVarName;

    const suffixes = ['_train', '_dev', '_test'];
    const collision = suffixes.some(suffix =>
        workspace.getVariable(newVarName + suffix) !== null
    );

    if (collision) {
      console.warn(`Cannot rename: Variable '${newVarName}_...' already exists.`);
      return null; 
    }

    suffixes.forEach(suffix => {
      const oldVarName = workspace.getVariable(oldName + suffix);
      if (oldVarName) {
        workspace.renameVariableById(oldVarName.getId(), newVarName + suffix);
      } else {
        workspace.createVariable(newVarName + suffix);
      }
    });

    return newVarName;
  },
};

Blockly.Blocks['kaiming_normalize'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Apply Kaiming Normalization");
    
    this.setInputsInline(true);

    this.appendValueInput("MODEL")
        .setCheck("Array")
        .appendField("to model");

    this.appendValueInput('SCALE')
        .setCheck('Number')
        .appendField('with scale');

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);

    this.setColour('#7986CB');
    this.setTooltip("Adjusts initial weights based on activation functions (ReLU/Tanh) to prevent vanishing gradients.");
  }
}

Blockly.Blocks['initialize_parameters'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Initialize Parameters");

    this.setInputsInline(true);

    this.appendValueInput("MODEL")
        .setCheck("Array")
        .appendField("for model");

    this.appendValueInput('TOKENIZER')
        .appendField('with tokenizer');
    
    this.appendValueInput('EMB_DIM')
        .appendField('and embedding dimension');

    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);

    this.setColour('#7986CB');
    this.setTooltip("Initializes");
  }
}

pythonGenerator.forBlock['linear'] = function(_block: Blockly.Block) {
  const className = pythonGenerator.provideFunction_(
      'Linear',
     Linear 
  );

  return `${className}(100, 100)\n`;
};

pythonGenerator.forBlock['batch_norm_1d'] = function(_block: Blockly.Block) {
  const className = pythonGenerator.provideFunction_(
      'BatchNorm1d',
      BatchNorm1d
  );
  return `${className}(100)`;
};

pythonGenerator.forBlock['tanh'] = function(_block: Blockly.Block) {
  const className = pythonGenerator.provideFunction_(
      'Tanh',
     Tanh 
  );
  return `${className}()`;
};

pythonGenerator.forBlock['relu'] = function(_block: Blockly.Block) {
  const className = pythonGenerator.provideFunction_(
      'ReLU',
      ReLU
  );
  return `${className}()`;
};

pythonGenerator.forBlock['sequential'] = function(block: Blockly.Block) {
  const linearClassName = pythonGenerator.provideFunction_(
      'Linear',
      Linear
  );

  const batchNorm1dClassName = pythonGenerator.provideFunction_(
      'BatchNorm1d',
      BatchNorm1d
  );
  
  const blockSize = pythonGenerator.valueToCode(block, 'BLOCK_SIZE', 0) || '8';
  const nHidden = pythonGenerator.valueToCode(block, 'NUM_HIDDEN', 0) || '200';
  const embDim = pythonGenerator.valueToCode(block, 'EMB_DIM', 0) || '10';
  const reps = pythonGenerator.valueToCode(block, 'REPS', 0) || '4';

  const varname = block.data ?? 'sequential_model';
  let layersCode = [];

  let currentInDim = `${embDim} * ${blockSize}`;
  
  for(let i = 0; i < (parseInt(reps) || 1); ++i) {
    let layerBlock = block.getInputTargetBlock('LAYERS');
    let line = '';
    while(layerBlock) {
      if(layerBlock.type === 'linear') {
        const blockCode = `${linearClassName}(${currentInDim}, ${nHidden})`;
        line += (blockCode + ', ')
        currentInDim = nHidden;
      }
      else if(layerBlock.type === 'batch_norm_1d') {
        const blockCode = `${batchNorm1dClassName}(${currentInDim})`;
        line += (blockCode + ', ')
        currentInDim = nHidden;
      }
      else {
        const generatorFunc = pythonGenerator.forBlock[layerBlock.type];
        if (generatorFunc) {
          let code = generatorFunc.call(pythonGenerator, layerBlock, pythonGenerator);
          if(Array.isArray(code)) {
            code = code[0];
          }

          code = code ? code.toString().trim() : '';

          if(code) {
            line += (code + ', ');
          }
        }
      }
      layerBlock = layerBlock.getNextBlock();
    }
    if(line) {
      layersCode.push(line + '\n    ')
    }
  }

  layersCode.push(`${linearClassName}(${currentInDim}, ${pythonGenerator.valueToCode(block, 'TOKENIZER', 0) || 'tokenizer'}.vocab_size)`)
  const innerContent = layersCode.join('');

  return `${varname} = [\n` +
      `    ${innerContent}\n` +
      `]\n\n`
};

pythonGenerator.forBlock['lsv_input'] = function(block: any) {
  const varname = block.data ?? 'lsv_input'; 
  const filename = block.getFieldValue('FILENAME');

  return LSVInput(varname, filename);
};

pythonGenerator.forBlock['custom_code'] = function(block: Blockly.Block) {
  return `${block.getFieldValue('CUSTOM_CODE')}\n`;
}

pythonGenerator.forBlock['build_tokenizer'] = function(block: any) {
  const varname = block.data ?? 'tokenizer';
  const words = pythonGenerator.valueToCode(block, 'DATA', 0) || '[]';

  const className = pythonGenerator.provideFunction_(
      'CharTokenizer',
      CharTokenizer
  );

  return `${varname} = ${className}(${words})\n`;
};

pythonGenerator.forBlock['build_dataset'] = function(block: any) {
  const tokenizerVar = pythonGenerator.valueToCode(block, 'TOKENIZER', 0) || 'tokenizer';
  const blockSize = pythonGenerator.valueToCode(block, 'BLOCK_SIZE', 0) || '3';

  const code = `${tokenizerVar}.export_dataset(${blockSize})\n`;

  return [code, 0];
};

pythonGenerator.forBlock['special_character'] = function(block: any) {
  const char = block.getFieldValue('CHAR');
  const code = `'${char}'`;
  return [code, 0];
};

pythonGenerator.forBlock['split_dataset'] = function(block: any) {
  const dataset = pythonGenerator.valueToCode(block, 'DATASET', 0) || 'dataset';
  const baseName = block.getFieldValue('BASE_NAME');
  const train_split = block.getFieldValue('TRAIN_SPLIT') / 100
  const dev_split = block.getFieldValue('DEV_SPLIT') / 100;

  const data_train = `${baseName}_train`;
  const data_dev   = `${baseName}_dev`;
  const data_test  = `${baseName}_test`;
  
  return SplitDataset(dataset, data_train, data_dev, data_test, train_split, dev_split);
};

pythonGenerator.forBlock['kaiming_normalize'] = function(block: any) {
  const modelName = pythonGenerator.valueToCode(block, 'MODEL', 0) || 'layers';
  const scale = pythonGenerator.valueToCode(block, 'SCALE', 0);

  const linearClass = pythonGenerator.provideFunction_('Linear', Linear);
  let activationChecks = "";

  KNOWN_ACTIVATIONS.forEach(activation => {
    if (block.workspace.getBlocksByType(activation.type).length > 0) {
      const actClassName = pythonGenerator.provideFunction_(activation.name, activation.classDef);

      activationChecks +=
          `                elif isinstance(next_layer, ${actClassName}):\n` +
          `                    gain = ${activation.gain}\n` +
          `                    break\n`;
    }
  });

  return KaimingNormalization(linearClass, scale, modelName, activationChecks);
};

pythonGenerator.forBlock['initialize_parameters'] = function(block: any) {
  const modelName = pythonGenerator.valueToCode(block, 'MODEL', 0) || 'layers';
  const tokenizer = pythonGenerator.valueToCode(block, 'TOKENIZER', 0) || 'tokenizer';
  const embDim = pythonGenerator.valueToCode(block, 'EMB_DIM', 0) || '10';
  
  return InitializeParameters(modelName, tokenizer, embDim);
}