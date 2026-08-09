import { TextFileView, MarkdownRenderer, setIcon, IconName, App, Modal, Setting, removeIcon } from "obsidian";
import { WordModal } from "../modals/wordmodal";
import { EnglishModal } from "../modals/englishmodal";
import { PartOfSpeechModal } from "../modals/partofspeechmodal";
import { EtymologyModal } from "../modals/etymologymodal";
import { NotesModal } from "../modals/notesmodal";
import { InflectionModal } from "../modals/inflectionmodal";
import { DeleteModal } from "../modals/deletemodal";
import { AddModal } from "../modals/addmodal";
import { ConfigureModal } from "../modals/configuremodal";

export type EtymologyDonation = {
    language: string;
    word: string;
    english: string;
    relationship: string;
};

export type InflectionTable = {
    top_headers: string[];
    left_headers: string[];
}

export type LexiconEntry = {
    word: string;
    english: string;
    part_of_speech: string;
    notes: string;
    etymology: EtymologyDonation[];
    inflection_table: InflectionTable;
    inflections: string[];
};

export type InflectionParadigm = {
    table: InflectionTable;
    inflections: string[];
}

export type Data = {
    inflection_paradigms: {
        [key: string]: InflectionParadigm;
    }
    entries: LexiconEntry[];
}

enum SearchColumn {
    NONE,
    WORD,
    ENGLISH,
    POS,
    NOTES
}

export const VIEW_TYPE_LEXICON = "lexicon-view";

export class LexiconView extends TextFileView {

    jsonData!: Data;
    tableEl!: HTMLElement;
    searchQuery = "";
    searchColumn: SearchColumn = SearchColumn.NONE;
    selectedSearch = "";

    getIcon(): IconName {
        return 'book-a';
    }

    getViewData() {
        return JSON.stringify(this.jsonData, null, 4);
    }

    setViewData(data: string, clear: boolean) {
        if (clear) {
            this.clear();
        }
        this.jsonData = JSON.parse(data);
        this.refresh();
    }

    clear() {
        this.jsonData = {inflection_paradigms: {}, entries: []};
    }

    getViewType() {
        return VIEW_TYPE_LEXICON;
    }

    async onOpen() {
        this.addAction("settings", "Configure Lexicon", () => {
            new ConfigureModal(this.app, this).open();
        });

        this.addAction("plus", "Add Entry", () => {
            new AddModal(this.app, (word, english, part_of_speech) => {
                this.jsonData.entries.push(
                    {
                        word: word,
                        english: english,
                        part_of_speech: part_of_speech,
                        etymology: [],
                        notes: "",
                        inflection_table: {
                            top_headers: [],
                            left_headers: [],
                        },
                        inflections: []
                    }
                );
                this.requestSave();
                this.refresh();
            }).open();
        });
    }

    async onClose() {
        this.contentEl.empty();
    }

    buildEtymologySpan(etymologyButton: HTMLButtonElement, lexicon_entry: { etymology: { language: string, word: string, english: string, relationship: string }[] }) {
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

    setNoteButtonText(notesButton: HTMLButtonElement, lexicon_entry: { notes: string }) {
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
        header_row.createEl("th");
        for (const header of lexicon_entry.inflection_table.top_headers) {
            header_row
                .createEl("th")
                .createEl("b", { text: header });
        }

        for (let i = 0; i < lexicon_entry.inflection_table.left_headers.length; i++) {
            const row = inflection_table_body.createEl("tr");
            row
                .createEl("th")
                .createEl("b", { text: lexicon_entry.inflection_table.left_headers[i] });

            for (let j = 0; j < lexicon_entry.inflection_table.top_headers.length; j++) {
                let index = (i * lexicon_entry.inflection_table.top_headers.length) + j

                row.createEl("td", { text: lexicon_entry.inflections[index] })
            }
        }

        return inflection_table;
    }

    // Remove the contents of an inflection that is now empty.
    deleteInflectionContents(inflection_label_container: HTMLDivElement, inflection_card: HTMLDivElement, inflection_contents: HTMLDivElement, inflection_label: HTMLDivElement, inflectionButton: HTMLButtonElement, lexicon_entry: { inflection_table: { top_headers: string[], left_headers: string[] }, inflections: string[]; }) {
        if (inflection_card.children[1].children[1] != null) {
            // Remove the dropdown arrow
            inflection_card.children[1].removeChild(inflection_card.children[1].children[1]);
        }

        if (inflection_contents.firstChild != null) {
            inflection_contents.removeChild(inflection_contents.firstChild!);
        }

        inflection_contents.addClass("hidden");

        inflection_card.setAttr("class", "inflection-card is-collapsed");
        inflection_label_container.onclick = (ev) => {
        }

        inflection_label.setText("No Inflection");
    }

    // Add the contents of an inflection.
    addInflectionContents(inflection_label_container: HTMLDivElement, inflection_card: HTMLDivElement, inflection_contents: HTMLDivElement, inflection_label: HTMLDivElement, inflectionButton: HTMLButtonElement, lexicon_entry: { inflection_table: { top_headers: string[], left_headers: string[] }, inflections: string[]; }) {
        let inflection_table = this.buildInflectionTable(lexicon_entry);

        let fold_icon = inflection_label_container.createDiv({ cls: "inflection-fold is-collapsed" });
        setIcon(fold_icon, 'chevron-down');

        inflection_contents.appendChild(inflection_table);

        inflection_label_container.onclick = (ev) => {
            if (inflection_contents.hasClass("hidden")) {
                inflection_contents.removeClass("hidden");
                fold_icon.setAttr("class", "inflection-fold");
                inflection_card.setAttr("class", "inflection-card");
            } else {
                inflection_contents.addClass("hidden");
                fold_icon.setAttr("class", "inflection-fold is-collapsed");
                inflection_card.setAttr("class", "inflection-card is-collapsed");
            }
        };

        inflection_label.setText("Inflection");
    }

    refresh() {
        this.jsonData.entries = this.jsonData.entries.sort((a: { word: string }, b: { word: string }) => (a.word.normalize("NFD").replace(/[\u0300-\u036f]/g, "") > b.word.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ? 1 : -1));

        this.contentEl.empty();

        if (this.jsonData.entries.length == 0) {
            let container = this.contentEl.createDiv({ cls: "lexicon-empty" });
            setIcon(container, "x");
            container.createSpan("lexicon-empty-label").setText("Nothing here yet! Press the + button in the top right to add an entry.");
        } else {
            let tableContainer = this.contentEl.createEl("div", { cls: "lexicon-container" })
            this.tableEl = tableContainer.createEl("table", { cls: "lexicon-table" });
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

            // Create the search row. This row contains all of the search bars for searchable columns.
            let lexicon_search_row = bodyEl.createEl("tr", { cls: "lexicon-search-row" });
            let wordSearchCell = lexicon_search_row.createEl("td");
            let wordSearch = wordSearchCell.createEl("input", { cls: "lexicon-search", attr: { placeholder: "search" } });
            let englishSearch = lexicon_search_row.createEl("td").createEl("input", { cls: "lexicon-search", attr: { placeholder: "search" } });
            let posSearch = lexicon_search_row.createEl("td").createEl("input", { cls: "lexicon-search", attr: { placeholder: "search" } });
            lexicon_search_row.createEl("td");
            let notesSearch = lexicon_search_row.createEl("td").createEl("input", { cls: "lexicon-search", attr: { placeholder: "search" } });
            lexicon_search_row.createEl("td");

            // Update the search query every time a search bar is edited.
            wordSearch.oninput = (ev) => {
                if (ev.currentTarget instanceof HTMLInputElement) {
                    this.searchQuery = ev.currentTarget.value;
                    this.searchColumn = this.searchQuery == "" ? SearchColumn.NONE : SearchColumn.WORD;
                    this.refresh();
                }
            };
            englishSearch.oninput = (ev) => {
                if (ev.currentTarget instanceof HTMLInputElement) {
                    this.searchQuery = ev.currentTarget.value;
                    this.searchColumn = this.searchQuery == "" ? SearchColumn.NONE : SearchColumn.ENGLISH;
                    this.refresh();
                }
            };
            posSearch.oninput = (ev) => {
                if (ev.currentTarget instanceof HTMLInputElement) {
                    this.searchQuery = ev.currentTarget.value;
                    this.searchColumn = this.searchQuery == "" ? SearchColumn.NONE : SearchColumn.POS;
                    this.refresh();
                }
            };
            notesSearch.oninput = (ev) => {
                if (ev.currentTarget instanceof HTMLInputElement) {
                    this.searchQuery = ev.currentTarget.value;
                    this.searchColumn = this.searchQuery == "" ? SearchColumn.NONE : SearchColumn.NOTES;
                    this.refresh();
                }
            };

            for (const [i, entry] of this.jsonData.entries.entries()) {
                // Defaults to "true" if there's no search query, otherwise will be false and will go through the check below
                let matches_search = this.searchQuery == "";

                if (!matches_search) {
                    switch (this.searchColumn) {
                        case SearchColumn.WORD:
                            matches_search = entry.word.contains(this.searchQuery);
                            break;
                        case SearchColumn.ENGLISH:
                            matches_search = entry.english.contains(this.searchQuery);
                            break;
                        case SearchColumn.POS:
                            matches_search = entry.part_of_speech.contains(this.searchQuery);
                            break;
                        case SearchColumn.NOTES:
                            matches_search = entry.notes.contains(this.searchQuery);
                            break;
                        case SearchColumn.NONE:
                            this.searchQuery = "";
                            break;
                    }
                }

                if (matches_search) {
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

                    inflection_contents.addClass("hidden");

                    let inflectionButton = inflection_card
                        .createEl("button", { cls: "lexicon-button inflection-button" });

                    let inflection_label_container = inflection_card
                        .createDiv({ cls: "inflection-label-container" });

                    if (
                        !("inflection_table" in entry) ||
                        !("top_headers" in entry.inflection_table) ||
                        !(entry.inflection_table.top_headers instanceof Array) ||
                        !('left_headers' in entry.inflection_table) ||
                        !(entry.inflection_table.left_headers instanceof Array)
                    ) {
                        entry.inflection_table = { top_headers: [], left_headers: [] };
                    }
                    if (!("inflections" in entry && entry.inflections instanceof Array)) {
                        entry.inflections = [];
                    }

                    inflectionButton.onclick = (ev) => {
                        new InflectionModal(this.app, entry.inflection_table, entry.inflections, (inflection_table, inflections) => {
                            entry.inflection_table = inflection_table;
                            entry.inflections = inflections;
                            this.requestSave();
                            if (
                                (entry.inflection_table.top_headers.length == 0) ||
                                (entry.inflection_table.left_headers.length == 0) ||
                                (entry.inflections.length == 0)
                            ) {
                                this.deleteInflectionContents(inflection_label_container, inflection_card, inflection_contents, inflection_label, inflectionButton, entry);
                            }
                            else {
                                if (inflection_contents.hasChildNodes()) {
                                    inflection_contents.removeChild(inflection_contents.firstChild!);
                                    inflection_contents.appendChild(this.buildInflectionTable(entry));
                                } else {
                                    this.deleteInflectionContents(inflection_label_container, inflection_card, inflection_contents, inflection_label, inflectionButton, entry);
                                    this.addInflectionContents(inflection_label_container, inflection_card, inflection_contents, inflection_label, inflectionButton, entry);
                                }

                            }
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
                    deleteButton.onclick = () => {
                        new DeleteModal(this.app, "Delete Lexeme", "Are you sure you want to delete this lexeme? This cannot be undone!", (confirm) => {
                            if (confirm) {
                                this.jsonData.entries.splice(this.jsonData.entries.indexOf(entry), 1);
                                this.requestSave();
                                deleteButton.parentElement!.parentElement!.remove();
                                if (this.jsonData.entries.length == 0) {
                                    this.refresh();
                                }
                            }
                        }).open();
                    };

                }
            }
        }
    }
}