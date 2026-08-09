import { App, Modal, setIcon, Setting, TextComponent } from "obsidian";
import { InflectionParadigm, InflectionTable } from "../views/lexiconview";


export class ParadigmModal extends Modal {
    table_container: HTMLDivElement;
    valid: boolean = false;
    add_button_setting: Setting;
    name: string;
    paradigms: {[key: string]: InflectionParadigm};
    edit: boolean;
    constructor(app: App, edit: boolean, original_name: string, original_table: InflectionTable, original_inflections: string[], paradigms: {[key: string]: InflectionParadigm}, onSubmit: (name: string, inflection_table: InflectionTable, inflections: string[]) => void) {
        super(app);
        this.setTitle("Add Paradigm");

        this.modalEl.addClass("inflection-modal");

        this.name = original_name;

        if (!edit) {
            new Setting(this.contentEl)
            .setName("Name")
            .setDesc("The name of the paradigm")
            .addText((text) => {
                text
                    .setValue(original_name)
                    .onChange((value) => {
                        this.name = value;
                        this.check_valid(top_headers, left_headers, inflections);
                    });
            });
        }

        this.paradigms = paradigms;
        this.edit = edit;

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

        let label = this.contentEl.createDiv( { cls: "paradigm-modal-label" } );
        label.setText("%word% will be replaced by the entry when the paradigm is used.");

        this.table_container = this.contentEl.createDiv({ cls: "inflection-modal-table-container" });

        this.add_button_setting = new Setting(this.contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText(edit ? "Edit" : "Add")
                    .setCta()
                    .onClick(() => {
                        if (top_headers[0] == "" || left_headers[0] == "" || inflections[0] == "") {
                            top_headers = [];
                            left_headers = [];
                            inflections = [];
                        }

                        if (this.valid) {
                            this.close();
                            onSubmit(this.name, {top_headers, left_headers}, inflections);
                        }
                    }));
        this.add_button_setting.settingEl.addClass("validated");

        this.render_table(top_headers, left_headers, inflections);
    }

    check_valid(top_headers: string[], left_headers: string[], inflections: string[]) {
        this.valid = true;
        this.add_button_setting.setName("");
        this.add_button_setting.controlEl.children[0].removeAttribute("disabled");
        for (const header of top_headers) {
            if (!header) {
                this.valid = false;
                this.add_button_setting.setName("All cells must be filled");
                this.add_button_setting.controlEl.children[0].setAttr("disabled", "");
            }
        }
        for (const header of left_headers) {
            if (!header) {
                this.valid = false;
                this.add_button_setting.setName("All cells must be filled");
                this.add_button_setting.controlEl.children[0].setAttr("disabled", "");
            }
        }
        for (const inflection of inflections) {
            if (!inflection) {
                this.valid = false;
                this.add_button_setting.setName("All cells must be filled");
                this.add_button_setting.controlEl.children[0].setAttr("disabled", "");
            }
        }
        if (this.name) {
            if (!this.edit) {
                for (const paradigm of Object.entries(this.paradigms)) {
                    if (this.name == paradigm[0]) {
                        this.valid = false;
                        this.add_button_setting.setName("Name must be unique");
                        this.add_button_setting.controlEl.children[0].setAttr("disabled", "");
                    }
                }
            }
        } else {
            this.valid = false;
            this.add_button_setting.setName("Invalid name");
            this.add_button_setting.controlEl.children[0].setAttr("disabled", "");
        }
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
            delete_column_button.onClickEvent(() => {
                if (top_headers.length === 1) {
                    top_headers.length = 0;
                    inflections.length = 0;
                    for (i = 0; i < left_headers.length; i++) {
                        inflections.push("");
                    }
                } else {
                    for (let i = inflections.length - 1; i >= 0; i--) {
                        if (i % top_headers.length === top_headers.length - 1) {
                            inflections.splice(i, 1);
                        }
                    }
                    top_headers.pop();
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
                        this.check_valid(top_headers, left_headers, inflections);
                    });
                })
                .setClass("inflection-modal-header");;
        }

        const new_column_button_cell = header_row.createEl("td");
        const new_column_button = new_column_button_cell.createEl("button", { cls: "inflection-modal-button new column" });
        setIcon(new_column_button, 'plus');
        new_column_button.onClickEvent(() => {
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
                delete_row_button.onClickEvent(() => {
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
                            this.check_valid(top_headers, left_headers, inflections);
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
                            this.check_valid(top_headers, left_headers, inflections);
                        });
                    });
        }

        let new_row_button_row = table_body.createEl("tr");
        new_row_button_row.createEl("td");
        let new_row_button_cell = new_row_button_row.createEl("td");
        let new_row_button = new_row_button_cell.createEl("button", { cls: "inflection-modal-button new row" });
        setIcon(new_row_button, 'plus');
        new_row_button.onClickEvent(() => {
            left_headers.push("");
            for (let i = 0; i < top_headers.length; i++) {
                inflections.push("");
            }
            this.render_table(top_headers, left_headers, inflections);
        });

        this.check_valid(top_headers, left_headers, inflections);
    }
}