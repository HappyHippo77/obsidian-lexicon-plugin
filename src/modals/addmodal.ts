import { App, Modal, Setting } from "obsidian";

export class AddModal extends Modal {
    constructor(app: App, onSubmit: (word: string, english: string, part_of_speech: string) => void) {
        super(app);
        this.setTitle('Add Lexeme');

        let word = "";
        let english = "";
        let part_of_speech = "";
        new Setting(this.contentEl)
            .setName('Word')
            .addText((text) => {
                text.onChange((value) => {
                    word = value;
                });
            });
        new Setting(this.contentEl)
            .setName('English')
            .addText((text) => {
                text.onChange((value) => {
                    english = value;
                });
            });
        new Setting(this.contentEl)
            .setName('Part of Speech')
            .addText((text) => {
                text.onChange((value) => {
                    part_of_speech = value;
                });
            });

        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Add')
                    .setCta()
                    .onClick(() => {
                        this.close();
                        onSubmit(word, english, part_of_speech);
                    }));
    }
}