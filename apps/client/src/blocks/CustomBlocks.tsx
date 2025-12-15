import * as Blockly from 'blockly/core';
import { pythonGenerator } from 'blockly/python';
import { FieldMultilineInput } from '@blockly/field-multilineinput';

Blockly.Blocks['linear'] = {
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField('Linear Layer');
    this.appendDummyInput()
        .appendField('In Features')
        .appendField(new Blockly.FieldNumber(10), 'IN_FEATURES');
    this.appendDummyInput()
        .appendField('Out Features')
        .appendField(new Blockly.FieldNumber(20), 'OUT_FEATURES');
    this.setColour('#5b80a5');
    this.setTooltip('Applies a linear transformation: y = xW^T + b');
  }
};

Blockly.Blocks['batch_norm_1d'] = {
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField('BatchNorm1d');
    this.setColour('#5b80a5');
  }
};

Blockly.Blocks['sequential'] = {
  init: function() {
    this.setColour('#0bd592'); 

    this.appendStatementInput('LAYERS')
        .setCheck(['Layers', 'Activations'])
        .appendField('Sequential Model');

    this.setPreviousStatement(false);
    this.setNextStatement(false);
    this.setOutput(false);

    this.setTooltip('A container that stacks layers sequentially.');
  }
};

Blockly.Blocks['tanh'] = {
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField('Tanh');
    this.setColour( '#5cb85c');
  }
};

Blockly.Blocks['relu'] = {
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.appendDummyInput()
        .appendField('ReLU');
    this.setColour('#5cb85c');
  }
};

Blockly.Blocks['custom_code'] = {
  init: function() {
    this.setPreviousStatement(true);
    this.setNextStatement(true);
   
    this.appendDummyInput()
        .appendField('Custom Code');
    
    const codeField = new FieldMultilineInput("print('Write code here')");

    this.appendDummyInput()
        .appendField(codeField, 'CUSTOM_CODE');
    this.setColour('#555555');
  }
};

pythonGenerator.forBlock['linear'] = function(block: Blockly.Block) {
  const in_feats = block.getFieldValue('IN_FEATURES');
  const out_feats = block.getFieldValue('OUT_FEATURES');

  return `Linear(${in_feats}, ${out_feats})\n`;
};

pythonGenerator.forBlock['batch_norm_1d'] = function(_block: Blockly.Block) {
  return 'BatchNorm1d\n';
};

pythonGenerator.forBlock['tanh'] = function(_block: Blockly.Block) {
  return 'Tanh()\n';
};

pythonGenerator.forBlock['relu'] = function(_block: Blockly.Block) {
  return 'ReLU()\n';
};

pythonGenerator.forBlock['sequential'] = function(block: Blockly.Block, generator) {
  const statements = generator.statementToCode(block, 'LAYERS')
      .trim()
      .split('\n')
      .map(line => line.trim())
      .join(', ');

  console.log(statements);
  
  return 'layers = [\n' +
      `    ${statements}\n` +
      ']';
};

pythonGenerator.forBlock['custom_code'] = function(block: Blockly.Block) {
  return block.getFieldValue('CUSTOM_CODE');
}