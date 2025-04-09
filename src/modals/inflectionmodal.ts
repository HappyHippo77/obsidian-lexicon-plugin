import { App, Modal, Setting } from "obsidian";

export class InflectionModal extends Modal {
    constructor(app: App, original_table: { top_headers: string[], left_headers: string[] }, original_inflections: string[], onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Edit Lexeme');

        let original_top_headers: string[] = [];
        let original_left_headers: string[] = [];

        for (const entry of original_table.top_headers) {
            original_top_headers.push(entry);
        }
        for (const entry of original_table.left_headers) {
            original_left_headers.push(entry);
        }

        let top_headers: string[] = original_top_headers;
        new Setting(this.contentEl)
            .setName('Inflection Top Headers')
            .addTextArea((text) => {
                text.onChange((value) => {
                    top_headers = value.split("\n");
                });
                text.setValue(original_top_headers.join("\n"));
            });
        let left_headers: string[] = original_left_headers;
        new Setting(this.contentEl)
            .setName('Inflection Left Headers')
            .addTextArea((text) => {
                text.onChange((value) => {
                    left_headers = value.split("\n");
                });
                text.setValue(original_left_headers.join("\n"));
            });
        let inflections: string[] = original_inflections;
        new Setting(this.contentEl)
            .setName('Inflections')
            .addTextArea((text) => {
                text.onChange((value) => {
                    inflections = value.split("\n");
                });
                text.setValue(original_inflections.join("\n"));
            });

        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Edit')
                    .setCta()
                    .onClick(() => {
                        if (top_headers[0] == "") {
                            top_headers = [];
                        }
                        if (left_headers[0] == "") {
                            left_headers = [];
                        }
                        if (inflections[0] == "") {
                            inflections = [];
                        }

                        let inflection_set = [];
                        inflection_set.push({ "top_headers": top_headers, "left_headers": left_headers });
                        inflection_set.push(inflections);

                        this.close();
                        onSubmit(JSON.stringify(inflection_set));
                    }));
    }
}