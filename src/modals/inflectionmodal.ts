import { App, ButtonComponent, DropdownComponent, Modal, setIcon, Setting, TextComponent } from "obsidian";
import { InflectionParadigm, InflectionTable } from "../views/lexiconview";


export class InflectionModal extends Modal {
    content_container: HTMLDivElement;
    valid: boolean = false;
    add_button_setting: Setting;
    paradigms: {[key: string]: InflectionParadigm};
    word: string;
    top_headers: string[];
    left_headers: string[];
    inflections: string[];
    constructor(app: App, word: string, paradigms: {[key: string]: InflectionParadigm}, original_table: InflectionTable, original_inflections: string[], onSubmit: (inflection_table: InflectionTable, inflections: string[]) => void) {
        super(app);
        this.setTitle("Edit Lexeme");

        this.modalEl.addClass("inflection-modal");

        this.top_headers = original_table.top_headers;
        this.left_headers = original_table.left_headers;
        this.inflections = original_inflections;

        this.word = word;
        this.paradigms = paradigms;

        new Setting(this.contentEl)
            .setName("Inflection")
            .addExtraButton((btn) => {
                btn
                    .setIcon("trash-2")
                    .onClick(() => {
                        this.top_headers.length = 0;
                        this.left_headers.length = 0;
                        this.inflections.length = 0;
                        this.render_table();
                        this.check_valid();
                    })
                    .extraSettingsEl.addClass("delete");
            });

        this.content_container = this.contentEl.createDiv({ cls: "inflection-modal-container" })

        this.add_button_setting = new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText('Edit')
                    .setCta()
                    .onClick(() => {
                        this.close();
                        onSubmit({top_headers: this.top_headers, left_headers: this.left_headers}, this.inflections);
                    }));
        this.add_button_setting.settingEl.addClass("validated");
        
        this.render_table();
    }

    check_valid() {
        this.valid = true;
        this.add_button_setting.setName("");
        this.add_button_setting.controlEl.children[0].removeAttribute("disabled");
        for (const header of this.top_headers) {
            if (!header) {
                this.valid = false;
                this.add_button_setting.setName("All cells must be filled");
                this.add_button_setting.controlEl.children[0].setAttr("disabled", true);
            }
        }
        for (const header of this.left_headers) {
            if (!header) {
                this.valid = false;
                this.add_button_setting.setName("All cells must be filled");
                this.add_button_setting.controlEl.children[0].setAttr("disabled", true);
            }
        }
        for (const inflection of this.inflections) {
            if (!inflection) {
                this.valid = false;
                this.add_button_setting.setName("All cells must be filled");
                this.add_button_setting.controlEl.children[0].setAttr("disabled", true);
            }
        }
    }

    render_table() {
        this.content_container.empty();

        if (this.top_headers.length == 0 || this.left_headers.length == 0 || this.inflections.length == 0) {
            let empty_container = this.content_container.createDiv({ cls: "inflection-modal-empty-container" });

            let paradigm_container = empty_container.createDiv({ cls: "inflection-modal-empty inflection-modal-empty-paradigm" });
            empty_container.createDiv({ cls: "inflection-modal-empty inflection-modal-empty-separator" }).setText("— OR —");
            let manual_container = empty_container.createDiv({ cls: "inflection-modal-empty inflection-modal-empty-manual" });

            let paradigm_selector = new DropdownComponent(paradigm_container)
                .addOption("","");
            for (const paradigm of Object.entries(this.paradigms)) {
                paradigm_selector.addOption(paradigm[0], paradigm[0])
            }
            new ButtonComponent(paradigm_container)
                .setButtonText("Use paradigm")
                .onClick(() => {
                    this.top_headers.length = 0;
                    this.left_headers.length = 0;
                    this.inflections.length = 0;

                    for (const paradigm of Object.entries(this.paradigms)) {
                        if (paradigm[0] == paradigm_selector.getValue()) {
                            for (const entry of paradigm[1].table.top_headers) {
                                this.top_headers.push(entry);
                            }
                            for (const entry of paradigm[1].table.left_headers) {
                                this.left_headers.push(entry);
                            }
                            for (const entry of paradigm[1].inflections) {
                                this.inflections.push(entry);
                            }
                        }

                        for (let i = 0; i < this.inflections.length; i++) {
                            this.inflections[i] = this.inflections[i].replace(/(?<!\\)%word%/, this.word);
                        }

                        this.render_table();
                        }
                });
            
            new ButtonComponent(manual_container)
                .setButtonText("Start from scratch")
                .onClick(() => {
                    this.top_headers = [""];
                    this.left_headers = [""];
                    this.inflections = [""];
                    this.render_table();
                });

        } else {
            let table_container = this.content_container.createDiv({ cls: "inflection-modal-table-container" });

            const table = table_container.createEl("table", { cls: "inflection-modal-table" });
            const table_body = table.createEl("tbody");

            const delete_column_row = table_body.createEl("tr");
            delete_column_row.createEl("td");
            delete_column_row.createEl("td");

            const header_row = table_body.createEl("tr");
            header_row.createEl("td");
            header_row.createEl("td");

            for (let i = 0; i < this.top_headers.length; i++) {
                const delete_column_cell = delete_column_row.createEl("td");
                const delete_column_button = delete_column_cell.createEl("button", { cls: "inflection-modal-button delete column" });
                setIcon(delete_column_button, 'trash-2');
                if (this.top_headers.length == 1) {
                    delete_column_button.setAttr("disabled", "");
                }
                delete_column_button.onClickEvent(() => {
                    for (let i = this.inflections.length; i > 0; i--) {
                        if (i % this.top_headers.length === this.top_headers.length - 1) {
                            this.inflections.splice(i, 1);
                        }
                    }
                    this.top_headers.splice(i, 1);
                    this.render_table();
                });

                const header = this.top_headers[i];

                const header_cell = header_row.createEl("td");

                new Setting(header_cell)
                    .addText((text) => {
                        text.setValue(header);

                        text.onChange((value) => {
                            this.top_headers[i] = value;
                            this.check_valid();
                        });
                    })
                    .setClass("inflection-modal-header");;
            }

            const new_column_button_cell = header_row.createEl("td");
            const new_column_button = new_column_button_cell.createEl("button", { cls: "inflection-modal-button new column" });
            setIcon(new_column_button, 'plus');
            new_column_button.onClickEvent(() => {
                this.top_headers.push("");
                for (let inflection_index = 0; inflection_index < this.inflections.length; inflection_index++) {
                    if (inflection_index % this.top_headers.length == this.top_headers.length - 1) {
                        this.inflections.splice(inflection_index, 0, "");
                    }
                }
                this.inflections.push("");
                this.render_table();
            });

            for (let inflection_index = 0; inflection_index < this.inflections.length; inflection_index++) {
                var row!: HTMLElement;
                
                if (inflection_index % this.top_headers.length == 0) {
                    let left_header_index = Math.floor(inflection_index / this.top_headers.length);

                    row = table_body.createEl("tr");

                    const delete_row_cell = row.createEl("td");
                    const delete_row_button = delete_row_cell.createEl("button", { cls: "inflection-modal-button delete row" });
                    setIcon(delete_row_button, 'trash-2');
                    if (this.left_headers.length == 1) {
                        delete_row_button.setAttr("disabled", "");
                    }
                    delete_row_button.onClickEvent(() => {
                        this.left_headers.splice(left_header_index, 1);
                        this.inflections.splice(left_header_index, this.top_headers.length);
                        this.render_table();
                    });

                    const header = this.left_headers[left_header_index];
                    const header_cell = row.createEl("td");
                    new Setting(header_cell)
                        .addText((text) => {
                            text.setValue(header);

                            text.onChange((value) => {
                                this.left_headers[left_header_index] = value;
                                this.check_valid();
                            });
                        })
                        .setClass("inflection-modal-header");
                }

                const cell = row.createEl("td");
                new Setting(cell)
                        .addText((text) => {
                            text.setValue(this.inflections[inflection_index]);

                            text.onChange((value) => {
                                this.inflections[inflection_index] = value;
                                this.check_valid();
                            });
                        });
            }

            let new_row_button_row = table_body.createEl("tr");
            new_row_button_row.createEl("td");
            let new_row_button_cell = new_row_button_row.createEl("td");
            let new_row_button = new_row_button_cell.createEl("button", { cls: "inflection-modal-button new row" });
            setIcon(new_row_button, 'plus');
            new_row_button.onClickEvent(() => {
                this.left_headers.push("");
                for (let i = 0; i < this.top_headers.length; i++) {
                    this.inflections.push("");
                }
                this.render_table();
            });

            this.check_valid();
        }
    }
}