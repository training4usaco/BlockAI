import * as Blockly from 'blockly';

export class FieldFilePicker extends Blockly.FieldTextInput {
    static type = 'field_file_picker';

    constructor(value: string) {
        super(value);
        this.setTooltip("Click to select a file from your computer");
    }

    protected showEditor_() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt'; 

        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                this.setValue(file.name);
            }
        };

        input.click();
    }
}

Blockly.fieldRegistry.register(FieldFilePicker.type, FieldFilePicker);