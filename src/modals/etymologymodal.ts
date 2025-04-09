import { App, Modal, Setting } from "obsidian";

export class EtymologyModal extends Modal {
    constructor(app: App, original: { language: string, word: string, english: string, relationship: string }[], onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Edit Lexeme');

        let original_languages: string[] = [];
        let original_words: string[] = [];
        let original_english: string[] = [];
        let original_relationships: string[] = [];

        if (Symbol.iterator in Object(original)) {
            for (const entry of original) {
                original_languages.push(entry.language);
                original_words.push(entry.word);
                original_english.push(entry.english);
                original_relationships.push(entry.relationship);
            }
        }

        let etymology_languages: string[] = original_languages;
        new Setting(this.contentEl)
            .setName('Etymology Languages')
            .addTextArea((text) => {
                text.onChange((value) => {
                    etymology_languages = value.split("\n");
                });
                text.setValue(original_languages.join("\n"));
            });
        let etymology_words: string[] = original_words;
        new Setting(this.contentEl)
            .setName('Etymology Words')
            .addTextArea((text) => {
                text.onChange((value) => {
                    etymology_words = value.split("\n");
                });
                text.setValue(original_words.join("\n"));
            });
        let etymology_english: string[] = original_english;
        new Setting(this.contentEl)
            .setName('Etymology English')
            .addTextArea((text) => {
                text.onChange((value) => {
                    etymology_english = value.split("\n");
                });
                text.setValue(original_english.join("\n"));
            });
        let etymology_relationships: string[] = original_relationships;
        new Setting(this.contentEl)
            .setName('Etymology Relationships')
            .addTextArea((text) => {
                text.onChange((value) => {
                    etymology_relationships = value.split("\n");
                });
                text.setValue(original_relationships.join("\n"));
            });

        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Edit')
                    .setCta()
                    .onClick(() => {
                        let etymology = [];
                        if (etymology_languages[0] != "" && etymology_words[0] != "" && etymology_english[0] != "" && etymology_relationships[0] != "") {
                            for (const [i, language] of etymology_languages.entries()) {
                                etymology.push({ "language": "", "word": "", "english": "", "relationship": "" });
                                etymology[i].language = language;
                                etymology[i].word = etymology_words[i];
                                etymology[i].english = etymology_english[i];
                                etymology[i].relationship = etymology_relationships[i];
                            }
                        }

                        this.close();
                        onSubmit(JSON.stringify(etymology));
                    }));
    }
}