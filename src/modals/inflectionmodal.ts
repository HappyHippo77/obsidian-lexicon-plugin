import { App, Modal, setIcon, Setting, TextComponent } from "obsidian";

export class InflectionModal extends Modal {
    table_container: HTMLDivElement;
    constructor(app: App, original_table: { top_headers: string[], left_headers: string[] }, original_inflections: string[], onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Edit Lexeme');

        let top_headers: string[] = [];
        for (const entry of original_table.top_headers) {
            top_headers.push(entry);
        }
        let left_headers: string[] = [];
        for (const entry of original_table.left_headers) {
            left_headers.push(entry);
        }
        let inflections: string[] = [];
        for (const entry of original_inflections) {
            inflections.push(entry);
        }

        let label = this.contentEl.createDiv( { cls: "inflection-modal-label" } );
        label.setText("Inflection")

        this.table_container = this.contentEl.createDiv({ cls: "inflection-modal-container" })

        this.render_table(top_headers, left_headers, inflections);

        new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Edit')
                    .setCta()
                    .onClick(() => {
                        console.log(top_headers, left_headers, inflections);
                        if (top_headers[0] == "" || left_headers[0] == "" || inflections[0] == "") {
                            top_headers = [];
                            left_headers = [];
                            inflections = [];
                        }

                        let inflection_set = [];
                        inflection_set.push({ "top_headers": top_headers, "left_headers": left_headers });
                        inflection_set.push(inflections);

                        this.close();
                        onSubmit(JSON.stringify(inflection_set));
                    }));
    }

    render_table(top_headers: string[], left_headers: string[], inflections: string[]) {
        this.table_container.empty();

        if (top_headers.length === 0) {
            top_headers.push("");
        }
        if (left_headers.length === 0) {
            left_headers.push("");
        }
        if (inflections.length === 0) {
            for (const a of top_headers) {
                for (const b of left_headers) {
                    inflections.push("");
                }
            }
        }

        const table = this.table_container.createEl("table", { cls: "inflection-modal-table" });
        const table_body = table.createEl("tbody");

        const delete_column_row = table_body.createEl("tr");
        delete_column_row.createEl("td");
        delete_column_row.createEl("td");

        const header_row = table_body.createEl("tr");
        header_row.createEl("td");
        header_row.createEl("td");

        for (let i = 0; i < top_headers.length; i++) {
            const delete_column_cell = delete_column_row.createEl("td");
            const delete_column_button = delete_column_cell.createEl("button", { cls: "inflection-modal-button delete column" });
            setIcon(delete_column_button, 'trash-2');
            delete_column_button.onClickEvent(ev => {
                console.log(top_headers, left_headers, inflections);
                if (top_headers.length === 1) {
                    top_headers.length = 0;
                    inflections.length = 0;
                    for (i = 0; i < left_headers.length; i++) {
                        inflections.push("");
                    }
                    console.log(top_headers, left_headers, inflections);
                } else {
                    for (let i = inflections.length - 1; i >= 0; i--) {
                        if (i % top_headers.length === top_headers.length - 1) {
                            inflections.splice(i, 1);
                        }
                    }
                    top_headers.pop();
                    console.log(top_headers, left_headers, inflections);
                }
                this.render_table(top_headers, left_headers, inflections);
            });

            const header = top_headers[i];

            const header_cell = header_row.createEl("td");

            new Setting(header_cell)
                .addText((text) => {
                    text.setValue(header);

                    text.onChange((value) => {
                        top_headers[i] = value;
                    });
                })
                .setClass("inflection-modal-header");;
        }

        const new_column_button_cell = header_row.createEl("td");
        const new_column_button = new_column_button_cell.createEl("button", { cls: "inflection-modal-button new column" });
        setIcon(new_column_button, 'plus');
        new_column_button.onClickEvent(ev => {
            top_headers.push("");
            for (let inflection_index = 0; inflection_index < inflections.length; inflection_index++) {
                if (inflection_index % top_headers.length == top_headers.length - 1) {
                    inflections.splice(inflection_index, 0, "");
                }
            }
            inflections.push("");
            this.render_table(top_headers, left_headers, inflections);
        });

        for (let inflection_index = 0; inflection_index < inflections.length; inflection_index++) {
            var row!: HTMLElement;
            
            if (inflection_index % top_headers.length == 0) {
                let left_header_index = Math.floor(inflection_index / top_headers.length);

                row = table_body.createEl("tr");

                const delete_row_cell = row.createEl("td");
                const delete_row_button = delete_row_cell.createEl("button", { cls: "inflection-modal-button delete row" });
                setIcon(delete_row_button, 'trash-2');
                delete_row_button.onClickEvent(ev => {
                    left_headers.pop();
                    inflections.splice(0 - top_headers.length);
                    this.render_table(top_headers, left_headers, inflections);
                });

                const header = left_headers[left_header_index];
                const header_cell = row.createEl("td");
                new Setting(header_cell)
                    .addText((text) => {
                        text.setValue(header);

                        text.onChange((value) => {
                            left_headers[left_header_index] = value;
                        });
                    })
                    .setClass("inflection-modal-header");
            }

            const cell = row.createEl("td");
            new Setting(cell)
                    .addText((text) => {
                        text.setValue(inflections[inflection_index]);

                        text.onChange((value) => {
                            inflections[inflection_index] = value;
                        });
                    });
        }

        let new_row_button_row = table_body.createEl("tr");
        new_row_button_row.createEl("td");
        let new_row_button_cell = new_row_button_row.createEl("td");
        let new_row_button = new_row_button_cell.createEl("button", { cls: "inflection-modal-button new row" });
        setIcon(new_row_button, 'plus');
        new_row_button.onClickEvent(ev => {
            left_headers.push("");
            for (let i = 0; i < top_headers.length; i++) {
                inflections.push("");
            }
            this.render_table(top_headers, left_headers, inflections);
        });
    }
}