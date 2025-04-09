import { App, Modal, Setting } from "obsidian";

export class WordModal extends Modal {
    constructor(app: App, original: string, onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Edit Lexeme');

        let word = original;
        new Setting(this.contentEl)
            .setName('Word')
            .addText((text) => {
                text.onChange((value) => {
                    word = value;
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
                        onSubmit(word);
                    }));
    }
}