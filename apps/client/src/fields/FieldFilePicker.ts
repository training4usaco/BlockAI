import * as Blockly from 'blockly';

export class FieldFilePicker extends Blockly.FieldTextInput {
    static type = 'field_file_picker';

    static fileRegistry: { [filename: string]: File } = {};

    constructor(value: string) {
        super(value);
        this.setTooltip("Click to select a file from your computer");
        this.setSpellcheck(false);
    }

    protected showEditor_() {
        const input = document.createElement('input');
        input.type = 'file';

        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (file) {
                this.setValue(file.name);

                FieldFilePicker.fileRegistry[file.name] = file;

                console.log(`Stored ${file.name} in registry.`);
            }
        };

        input.click();
    }
}

Blockly.fieldRegistry.register(FieldFilePicker.type, FieldFilePicker);