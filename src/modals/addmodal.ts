import { App, Modal, Setting } from "obsidian";

export class AddModal extends Modal {
    constructor(app: App, onSubmit: (result: string) => void) {
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
                        let result = [];
                        if (word != "" && english != "" && part_of_speech != "") {
                            result.push(word);
                            result.push(english);
                            result.push(part_of_speech);
                        }
                        this.close();
                        onSubmit(JSON.stringify(result));
                    }));
    }
}