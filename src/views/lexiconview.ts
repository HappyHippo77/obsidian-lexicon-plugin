import { TextFileView, MarkdownRenderer, setIcon, IconName, App, Modal, Setting, removeIcon } from "obsidian";
import { WordModal } from "src/modals/wordmodal";
import { EnglishModal } from "src/modals/englishmodal";
import { PartOfSpeechModal } from "src/modals/partofspeechmodal";
import { EtymologyModal } from "src/modals/etymologymodal";
import { NotesModal } from "src/modals/notesmodal";
import { InflectionModal } from "src/modals/inflectionmodal";
import { DeleteModal } from "src/modals/deletemodal";
import { AddModal } from "src/modals/addmodal";

export const VIEW_TYPE_LEXICON = "lexicon-view";

export class LexiconView extends TextFileView {
    jsonData: any;
    tableEl: HTMLElement;
    searchQuery = "";
    searchColumn = "";
    selectedSearch = "";

    getIcon(): IconName {
        return 'book-a';
    }

    getViewData() {
        return JSON.stringify(this.jsonData, null, 4);
    }

    setViewData(data: string, clear: boolean) {
        this.jsonData = JSON.parse(data);
        this.refresh();
    }

    clear() {
        this.jsonData = "";
    }

    getViewType() {
        return VIEW_TYPE_LEXICON;
    }

    async onOpen() {
        this.tableEl = this.contentEl.createEl("table", { cls: "lexicon-table" } );
        const bodyEl = this.tableEl.createEl("tbody");

        // Create the header rows. Add a button on the far right to add a new entry.
        let lexicon_header_row = bodyEl
            .createEl("tr", { cls: "lexicon-header-row" })
        lexicon_header_row.createEl("td", { text: "Word" })
        lexicon_header_row.createEl("td", { text: "English" })
        lexicon_header_row.createEl("td", { text: "POS" })
        lexicon_header_row.createEl("td", { text: "Etymology" })
        lexicon_header_row.createEl("td", { text: "Notes" })
        lexicon_header_row.createEl("td", { text: "Inflection" })

        let addButton = lexicon_header_row.createEl("td").createEl("button", { cls: "lexicon-button add-button" } );
        setIcon(addButton, 'plus')
        addButton.onclick = (ev) => {
            new AddModal(this.app, (result) => {
                let newLexeme = JSON.parse(result);
                if (Array.isArray(newLexeme) && newLexeme.length == 3) {
                    this.jsonData.push(
                        {
                            "word": newLexeme[0],
                            "english": newLexeme[1],
                            "part_of_speech": newLexeme[2],
                            "etymology": [],
                            "notes": "",
                            "inflection_table": {
                                "top_headers": [],
                                "left_headers": [],
                            },
                            "inflections": []
                        }
                    );
                    this.requestSave();
                    this.refresh();
                }
            }).open();
        };

        // Create the search row. This row contains all of the search bars for searchable columns.
        let lexicon_search_row = bodyEl.createEl("tr", { cls: "lexicon-search-row" });
        let wordSearchCell = lexicon_search_row.createEl("td");
        let wordSearch = wordSearchCell.createEl("input", { cls: "lexicon-search", attr: {placeholder: "search"} } );
        let englishSearch = lexicon_search_row.createEl("td").createEl("input", { cls: "lexicon-search", attr: {placeholder: "search"} } );
        let posSearch = lexicon_search_row.createEl("td").createEl("input", { cls: "lexicon-search", attr: {placeholder: "search"} } );
        lexicon_search_row.createEl("td");
        let notesSearch = lexicon_search_row.createEl("td").createEl("input", { cls: "lexicon-search", attr: {placeholder: "search"} } );
        lexicon_search_row.createEl("td");

        // Update the search query every time a search bar is edited.
        wordSearch.oninput = (ev) => {
            if (ev.currentTarget instanceof HTMLInputElement) {
                this.searchQuery = ev.currentTarget.value;
                this.searchColumn = this.searchQuery == "" ? "" : "word";
                this.refresh();
            }
        };
        englishSearch.oninput = (ev) => {
            if (ev.currentTarget instanceof HTMLInputElement) {
                this.searchQuery = ev.currentTarget.value;
                this.searchColumn = this.searchQuery == "" ? "" : "english";
                this.refresh();
            }
        };
        posSearch.oninput = (ev) => {
            if (ev.currentTarget instanceof HTMLInputElement) {
                this.searchQuery = ev.currentTarget.value;
                this.searchColumn = this.searchQuery == "" ? "" : "part_of_speech";
                this.refresh();
            }
        };
        notesSearch.oninput = (ev) => {
            if (ev.currentTarget instanceof HTMLInputElement) {
                this.searchQuery = ev.currentTarget.value;
                this.searchColumn = this.searchQuery == "" ? "" : "notes";
                this.refresh();
            }
        };
    }

    async onClose() {
        this.contentEl.empty();
    }

    buildEtymologySpan(etymologyButton: HTMLButtonElement, lexicon_entry: {etymology: {language: string, word: string, english: string, relationship: string}[]}) {
        let etymology_span = this.contentEl
            .createSpan({ cls: "etymology-span" });
        if (Array.isArray(lexicon_entry.etymology) && lexicon_entry.etymology.length > 0) {
            etymology_span.appendText("from: ")
        }
        for (const i in lexicon_entry.etymology) {
            switch (lexicon_entry.etymology[i].relationship) {
                case "concat":
                    etymology_span.createSpan({ text: " + ", cls: "etymology-joiner" });
                    break;
                case "infix":
                    etymology_span.createSpan({ text: " < ", cls: "etymology-joiner" });
                    break;
                case "suppletion":
                    etymology_span.createSpan({ text: " ~ ", cls: "etymology-joiner" });
            }

            etymology_span.createSpan({ text: lexicon_entry.etymology[i].language + " ", cls: "etymology-language" });
            etymology_span.createSpan({ text: lexicon_entry.etymology[i].word + ", ", cls: "etymology-word" });
            etymology_span.createSpan({ text: '"' + lexicon_entry.etymology[i].english + '"', cls: "etymology-english" });
        }

        if (etymology_span.textContent == "") {
            setIcon(etymologyButton, 'plus');
            etymologyButton.setAttr("class", "lexicon-button etymology-button empty")
        } else {
            etymologyButton.setAttr("class", "lexicon-button etymology-button")
        }

        return etymology_span;
    }

    setNoteButtonText(notesButton: HTMLButtonElement, lexicon_entry: {notes: string}) {
        if (lexicon_entry.notes == undefined) {
            lexicon_entry.notes = "";
        }

        notesButton.empty();
        notesButton.setText(lexicon_entry.notes);
        if (notesButton.textContent == "") {
            setIcon(notesButton, 'plus');
            notesButton.setAttr("class", "lexicon-button notes-button empty");
        } else {
            notesButton.setAttr("class", "lexicon-button notes-button");
        }
    }

    buildInflectionTable(lexicon_entry: { inflection_table: { top_headers: string[], left_headers: string[] }, inflections: string[]; }) {
        const inflection_table = this.contentEl.createEl("table", { cls: "inflection-table" });
        const inflection_table_body = inflection_table.createEl("tbody");
        const header_row = inflection_table_body.createEl("tr");
        header_row.createEl("td");
        for (const header of lexicon_entry.inflection_table.top_headers) {
            header_row
                .createEl("td")
                .createEl("b", { text: header });
        }

        for (let i = 0; i < lexicon_entry.inflection_table.left_headers.length; i++) {
            const row = inflection_table_body.createEl("tr");
            row
                .createEl("td")
                .createEl("b", { text: lexicon_entry.inflection_table.left_headers[i] });

            for (let j = 0; j < lexicon_entry.inflection_table.top_headers.length; j++) {
                let index = (i * lexicon_entry.inflection_table.top_headers.length) + j

                row.createEl("td", { text: lexicon_entry.inflections[index] })
            }
        }

        return inflection_table;
    }

    // Code that is run by the inflectionButton of both empty and full inflection entries.
    inflectionButtonCommon(result: string, lexicon_entry: { inflection_table: { top_headers: string[], left_headers: string[] }, inflections: string[]; }) {
        lexicon_entry.inflection_table = JSON.parse(result)[0];
        lexicon_entry.inflections = JSON.parse(result)[1];
        this.requestSave();
    }
    // Code that is run by inflectionButton of empty inflection entries. Full entry behavior is defined in addInflectionContents().
    inflectionButtonEmpty(result: string, inflection_label_container: HTMLDivElement, inflection_card: HTMLDivElement, inflection_contents: HTMLDivElement, inflection_label: HTMLDivElement, inflectionButton: HTMLButtonElement, lexicon_entry: { inflection_table: { top_headers: string[], left_headers: string[] }, inflections: string[]; }) {
        this.inflectionButtonCommon(result, lexicon_entry);
        if (
            lexicon_entry.inflection_table.top_headers.length == 1 && lexicon_entry.inflection_table.top_headers[0] == "" ||
            lexicon_entry.inflection_table.left_headers.length == 1 && lexicon_entry.inflection_table.left_headers[0] == "" ||
            lexicon_entry.inflections.length == 1 && lexicon_entry.inflections[0] == ""
        ) {
            this.deleteInflectionContents(inflection_label_container, inflection_card, inflection_contents, inflection_label, inflectionButton, lexicon_entry);
        }
        else {
            this.addInflectionContents(inflection_label_container, inflection_card, inflection_contents, inflection_label, inflectionButton, lexicon_entry);
        }
    }

    // Remove the contents of an inflection that is now empty.
    deleteInflectionContents (inflection_label_container: HTMLDivElement, inflection_card: HTMLDivElement, inflection_contents: HTMLDivElement, inflection_label: HTMLDivElement, inflectionButton: HTMLButtonElement, lexicon_entry: { inflection_table: { top_headers: string[], left_headers: string[] }, inflections: string[]; }) {
        inflectionButton.onclick = (ev) => {
            new InflectionModal(this.app, { top_headers: [], left_headers: [] }, [], (result) => {
                this.inflectionButtonEmpty(result, inflection_label_container, inflection_card, inflection_contents, inflection_label, inflectionButton, lexicon_entry);
            }).open();
        };

        // Remove the dropdown arrow
        inflection_card.children[1].removeChild(inflection_card.children[1].children[1]);

        inflection_contents.removeChild(inflection_contents.firstChild!);
        inflection_contents.setAttr("style", "display: none;");

        inflection_card.setAttr("class", "inflection-card is-collapsed");
        inflection_label_container.onclick = (ev) => {
        }

        inflection_label.setText("No Inflection");
    }

    // Add the contents of an inflection.
    addInflectionContents(inflection_label_container: HTMLDivElement, inflection_card: HTMLDivElement, inflection_contents: HTMLDivElement, inflection_label: HTMLDivElement, inflectionButton: HTMLButtonElement, lexicon_entry: { inflection_table: { top_headers: string[], left_headers: string[] }, inflections: string[]; }) {
        let inflection_table = this.buildInflectionTable(lexicon_entry);

        inflectionButton.onclick = (ev) => {
            new InflectionModal(this.app, lexicon_entry.inflection_table, lexicon_entry.inflections, (result) => {
                this.inflectionButtonCommon(result, lexicon_entry);
                if (
                    (lexicon_entry.inflection_table.top_headers.length == 0) ||
                    (lexicon_entry.inflection_table.left_headers.length == 0) ||
                    (lexicon_entry.inflections.length == 0)
                ) {
                    this.deleteInflectionContents(inflection_label_container, inflection_card, inflection_contents, inflection_label, inflectionButton, lexicon_entry);
                }
                else {
                    inflection_contents.removeChild(inflection_contents.firstChild!);
                    inflection_contents.appendChild(this.buildInflectionTable(lexicon_entry));
                }
            }).open();
        };

        let fold_icon = inflection_label_container.createDiv({ cls: "inflection-fold is-collapsed" });
        setIcon(fold_icon, 'chevron-down');

        inflection_contents.appendChild(inflection_table);

        inflection_label_container.onclick = (ev) => {
            if (inflection_contents.hasAttribute("style")) {
                inflection_contents.removeAttribute("style");
                fold_icon.setAttr("class", "inflection-fold");
                inflection_card.setAttr("class", "inflection-card");
            } else {
                inflection_contents.setAttr("style", "display: none;");
                fold_icon.setAttr("class", "inflection-fold is-collapsed");
                inflection_card.setAttr("class", "inflection-card is-collapsed");
            }
        };

        inflection_label.setText("Inflection");
    }

    refresh() {
        this.jsonData = this.jsonData.sort((a: {word: string}, b: {word: string}) => (a.word.normalize("NFD").replace(/[\u0300-\u036f]/g, "") > b.word.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ? 1 : -1));

        let bodyEl = this.tableEl.children[0];

        // Remove old data from table.
        while (bodyEl.childNodes.length > 2) {
            bodyEl.removeChild(bodyEl.lastChild!);
        }

        for (const [i, entry] of this.jsonData.entries()) {
            if (this.searchQuery == "" || entry.hasOwnProperty(this.searchColumn) && entry[this.searchColumn].includes(this.searchQuery)) {
                const rowEl = bodyEl.createEl("tr");

                const wordButton = rowEl
                    .createEl("td")
                    .createEl("button", { text: entry.word, cls: "lexicon-button word-button" });
                wordButton.onclick = (ev) => {
                    new WordModal(this.app, entry.word, (result) => {
                        entry.word = result;
                        this.requestSave();
                        wordButton.setText(entry.word);
                    }).open();
                };

                const englishButton = rowEl
                    .createEl("td")
                    .createEl("button", { text: entry.english, cls: "lexicon-button english-button" });
                englishButton.onclick = (ev) => {
                    new EnglishModal(this.app, entry.english, (result) => {
                        entry.english = result;
                        this.requestSave();
                        englishButton.setText(entry.english);
                    }).open();
                };

                const partOfSpeechButton = rowEl
                    .createEl("td")
                    .createEl("button", { text: entry.part_of_speech, cls: "lexicon-button part-of-speech-button" });
                partOfSpeechButton.onclick = (ev) => {
                    new PartOfSpeechModal(this.app, entry.part_of_speech, (result) => {
                        entry.part_of_speech = result;
                        this.requestSave();
                        partOfSpeechButton.setText(entry.part_of_speech);
                    }).open();
                };

                const etymologyButton = rowEl
                    .createEl("td")
                    .createEl("button", { cls: "lexicon-button etymology-button" });

                let etymology_span = this.buildEtymologySpan(etymologyButton, entry);

                etymologyButton.appendChild(etymology_span);
                etymologyButton.onclick = (ev) => {
                    new EtymologyModal(this.app, entry.etymology, (result) => {
                        entry.etymology = JSON.parse(result);
                        this.requestSave();
                        etymologyButton.empty();
                        etymologyButton.appendChild(this.buildEtymologySpan(etymologyButton, entry));
                    }).open();
                };

                const notesButton = rowEl
                    .createEl("td")
                    .createEl("button", { cls: "lexicon-button notes-button" });
                
                this.setNoteButtonText(notesButton, entry);

                notesButton.onclick = (ev) => {
                    new NotesModal(this.app, entry.notes, (result) => {
                        entry.notes = result;
                        this.requestSave();
                        this.setNoteButtonText(notesButton, entry);
                    }).open();
                };

                let inflection_div = rowEl
                    .createEl("td")
                    .createDiv({ cls: "inflection" });

                let inflection_card = inflection_div
                    .createDiv({ cls: "inflection-card is-collapsed" });
                
                let inflection_contents = inflection_div
                    .createDiv({ cls: "inflection-contents" });

                inflection_contents.setAttr("style", "display: none;");

                let inflectionButton = inflection_card
                    .createEl("button", { cls: "lexicon-button inflection-button" });

                let inflection_label_container = inflection_card
                    .createDiv({ cls: "inflection-label-container" });

                inflectionButton.onclick = (ev) => {
                    new InflectionModal(this.app, { top_headers: [], left_headers: [] }, [], (result) => {
                        this.inflectionButtonEmpty(result, inflection_label_container, inflection_card, inflection_contents, inflection_label, inflectionButton, entry);
                    }).open();
                };

                setIcon(inflectionButton, 'table');

                let inflection_label = inflection_label_container
                    .createDiv({ cls: "inflection-label" });
                
                // This will get overwritten by the line below this if it needs to be.
                inflection_label.setText("No Inflection");

                if (Array.isArray(entry.inflections) && entry.inflections.length > 0) {
                    this.addInflectionContents(inflection_label_container, inflection_card, inflection_contents, inflection_label, inflectionButton, entry);
                }

                const deleteButton = rowEl
                    .createEl("td")
                    .createEl("button", { cls: "lexicon-button delete-button" });
                    setIcon(deleteButton, 'trash-2');
                    deleteButton.onclick = (ev) => {
                    new DeleteModal(this.app, (result) => {
                        if (result == "delete") {
                            this.jsonData.splice(this.jsonData.indexOf(entry), 1);
                            this.requestSave();
                            deleteButton.parentElement!.parentElement!.remove();
                        }
                    }).open();
                };

            }
        }
    }
}