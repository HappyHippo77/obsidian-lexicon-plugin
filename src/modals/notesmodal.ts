import { App, Modal, Setting } from "obsidian";

export class NotesModal extends Modal {
    constructor(app: App, original: string, onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Edit Lexeme');

        let notes = original;
        new Setting(this.contentEl)
            .setName('Notes')
            .addText((text) => {
                text.onChange((value) => {
                    notes = value;
                });
                text.setValue(original);
            });

        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Edit')
                    .setCta()
                    .onClick(() => {
                        this.close();
                        onSubmit(notes);
                    }));
    }
}