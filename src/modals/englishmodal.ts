import { App, Modal, Setting } from "obsidian";

export class EnglishModal extends Modal {
    constructor(app: App, original: string, onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Edit Lexeme');

        let english = original;
        new Setting(this.contentEl)
            .setName('English')
            .addText((text) => {
                text.onChange((value) => {
                    english = value;
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
                        onSubmit(english);
                    }));
    }
}