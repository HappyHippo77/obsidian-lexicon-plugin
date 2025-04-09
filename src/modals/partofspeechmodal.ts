import { App, Modal, Setting } from "obsidian";

export class PartOfSpeechModal extends Modal {
    constructor(app: App, original: string, onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Edit Lexeme');

        let part_of_speech = original;
        new Setting(this.contentEl)
            .setName('Part of Speech')
            .addText((text) => {
                text.onChange((value) => {
                    part_of_speech = value;
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
                        onSubmit(part_of_speech);
                    }));
    }
}