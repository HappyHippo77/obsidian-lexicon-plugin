import { TextFileView, MarkdownRenderer, setIcon, IconName, App, Modal, Setting } from "obsidian";
import { WordModal } from "src/modals/wordmodal";

export const VIEW_TYPE_LEXICON = "lexicon-view";

export class EnglishModal extends Modal {
    constructor(app: App, original: string, onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Edit Lexeme');

        let english = original;
        new Setting(this.contentEl)
            .setName('English')
            .addText((text) => {
                text.onChange((value) => {
                    english = value;
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
                        onSubmit(english);
                    }));
    }
}
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
export class NotesModal extends Modal {
    constructor(app: App, original: string, onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Edit Lexeme');

        let notes = original;
        new Setting(this.contentEl)
            .setName('Notes')
            .addText((text) => {
                text.onChange((value) => {
                    notes = value;
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
                        onSubmit(notes);
                    }));
    }
}
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
                        console.log(top_headers)
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
export class DeleteModal extends Modal {
    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.setTitle('Delete Lexeme');
        this.setContent('Are you sure you want to delete this lexeme? This cannot be undone!');

        let buttons = new Setting(this.contentEl)
        buttons
            .addButton((btn) =>
                btn
                    .setButtonText('Cancel')
                    .onClick(() => {
                        this.close();
                        onSubmit("cancel");
                    }));
        buttons
            .addButton((btn) =>
                btn
                    .setButtonText('Delete')
                    .setWarning()
                    .onClick(() => {
                        this.close();
                        onSubmit("delete");
                    }));
    }
}
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

export class LexiconView extends TextFileView {
    jsonData: any;
    tableEl: HTMLElement;
    searchQuery = "";
    searchColumn = "";

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
    }

    async onClose() {
        this.contentEl.empty();
    }

    refresh() {
        this.jsonData = this.jsonData.sort((a: {word: string}, b: {word: string}) => (a.word.normalize("NFD").replace(/[\u0300-\u036f]/g, "") > b.word.normalize("NFD").replace(/[\u0300-\u036f]/g, "") ? 1 : -1));

        // Remove previous data.
        this.tableEl.empty();

        const bodyEl = this.tableEl.createEl("tbody");
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
                            "part_of_speech": newLexeme[2]
                        }
                    );
                    this.requestSave();
                    this.refresh();
                }
            }).open();
        };

        let lexicon_search_row = bodyEl
            .createEl("tr", { cls: "lexicon-search-row" })
        let wordSearchCell = lexicon_search_row.createEl("td");
        let wordSearch = wordSearchCell
            .createEl("input", { cls: "lexicon-search", attr: {placeholder: "search"} } );
        let englishSearch = lexicon_search_row.createEl("td")
            .createEl("input", { cls: "lexicon-search", attr: {placeholder: "search"} } );
        let posSearch = lexicon_search_row.createEl("td")
            .createEl("input", { cls: "lexicon-search", attr: {placeholder: "search"} } );
        lexicon_search_row.createEl("td")
        let notesSearch = lexicon_search_row.createEl("td")
            .createEl("input", { cls: "lexicon-search", attr: {placeholder: "search"} } );
        lexicon_search_row.createEl("td")

        if (this.searchQuery != "") {
            switch (this.searchColumn) {
                case "word":
                    wordSearch.value = this.searchQuery;
                    wordSearch.focus();
                    break;
                case "english":
                    englishSearch.value = this.searchQuery;
                    englishSearch.focus();
                    break;
                case "part_of_speech":
                    posSearch.value = this.searchQuery;
                    posSearch.focus();
                    break;
                case "notes":
                    notesSearch.value = this.searchQuery;
                    notesSearch.focus();
                    break;
            }
        }

        wordSearch.oninput = (ev) => {
            if (ev.currentTarget instanceof HTMLInputElement) {
                console.log("hello");
                this.searchQuery = ev.currentTarget.value;
                this.searchColumn = "word";
                this.refresh();
            }
        };
        englishSearch.oninput = (ev) => {
            if (ev.currentTarget instanceof HTMLInputElement) {
                this.searchQuery = ev.currentTarget.value;
                this.searchColumn = "english";
                this.refresh();
            }
        };
        posSearch.oninput = (ev) => {
            if (ev.currentTarget instanceof HTMLInputElement) {
                this.searchQuery = ev.currentTarget.value;
                this.searchColumn = "part_of_speech";
                this.refresh();
            }
        };
        notesSearch.oninput = (ev) => {
            if (ev.currentTarget instanceof HTMLInputElement) {
                this.searchQuery = ev.currentTarget.value;
                this.searchColumn = "notes";
                this.refresh();
            }
        };

        if (this.searchQuery == "") {
            this.searchColumn = "";
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
                        this.refresh();
                    }).open();
                };

                const englishButton = rowEl
                    .createEl("td")
                    .createEl("button", { text: entry.english, cls: "lexicon-button english-button" });
                englishButton.onclick = (ev) => {
                    new EnglishModal(this.app, entry.english, (result) => {
                        entry.english = result;
                        this.requestSave();
                        this.refresh();
                    }).open();
                };

                const partOfSpeechButton = rowEl
                    .createEl("td")
                    .createEl("button", { text: entry.part_of_speech, cls: "lexicon-button part-of-speech-button" });
                partOfSpeechButton.onclick = (ev) => {
                    new PartOfSpeechModal(this.app, entry.part_of_speech, (result) => {
                        entry.part_of_speech = result;
                        this.requestSave();
                        this.refresh();
                    }).open();
                };

                let etymology_span = rowEl
                    .createSpan({ cls: "etymology-span" });
                if (Array.isArray(entry.etymology) && entry.etymology.length > 0) {
                    etymology_span.appendText("from: ")
                }
                for (const i in entry.etymology) {
                    switch (entry.etymology[i].relationship) {
                        case "concat":
                            etymology_span.createSpan({ text: " + ", cls: "etymology-joiner" });
                            break;
                        case "infix":
                            etymology_span.createSpan({ text: " < ", cls: "etymology-joiner" });
                            break;
                        case "suppletion":
                            etymology_span.createSpan({ text: " ~ ", cls: "etymology-joiner" });
                    }

                    etymology_span.createSpan({ text: entry.etymology[i].language + " ", cls: "etymology-language" });
                    etymology_span.createSpan({ text: entry.etymology[i].word + ", ", cls: "etymology-word" });
                    etymology_span.createSpan({ text: '"' + entry.etymology[i].english + '"', cls: "etymology-english" });
                }

                const etymologyButton = rowEl
                    .createEl("td")
                    .createEl("button", { cls: "lexicon-button etymology-button" });
                if (etymology_span.textContent == "") {
                    setIcon(etymologyButton, 'plus');
                    etymologyButton.setAttr("class", "lexicon-button etymology-button empty")
                }
                etymologyButton.appendChild(etymology_span);
                etymologyButton.onclick = (ev) => {
                    new EtymologyModal(this.app, entry.etymology, (result) => {
                        entry.etymology = JSON.parse(result);
                        this.requestSave();
                        this.refresh();
                    }).open();
                };

                const notesButton = rowEl
                    .createEl("td")
                    .createEl("button", { text: entry.notes, cls: "lexicon-button notes-button" });
                if (notesButton.textContent == "") {
                    setIcon(notesButton, 'plus');
                    notesButton.setAttr("class", "lexicon-button notes-button empty")
                }
                notesButton.onclick = (ev) => {
                    new NotesModal(this.app, entry.notes, (result) => {
                        entry.notes = result;
                        this.requestSave();
                        this.refresh();
                    }).open();
                };


                let inflection_div = rowEl
                    .createEl("td")
                    .createDiv({ cls: "inflection" });

                let inflection_card = inflection_div
                    .createDiv({ cls: "inflection-card is-collapsed" });

                let inflectionButton = inflection_card
                    .createEl("button", { cls: "lexicon-button inflection-button" });

                inflectionButton.onclick = (ev) => {
                    new InflectionModal(this.app, { top_headers: [], left_headers: [] }, [], (result) => {
                        entry.inflection_table = JSON.parse(result)[0];
                        entry.inflections = JSON.parse(result)[1];
                        this.requestSave();
                        this.refresh();
                    }).open();
                };

                setIcon(inflectionButton, 'table');

                let inflection_header = inflection_card
                    .createDiv({ cls: "inflection-label" });

                inflection_header.appendText(Array.isArray(entry.inflections) && entry.inflections.length ? "Inflection" : "No Inflection")

                if (Array.isArray(entry.inflections) && entry.inflections.length > 0) {

                    const inflection_table = this.contentEl.createEl("table", { cls: "inflection-table" });
                    const inflection_table_body = inflection_table.createEl("tbody");
                    const header_row = inflection_table_body.createEl("tr");
                    header_row.createEl("td");
                    for (const header of entry.inflection_table.top_headers) {
                        header_row
                            .createEl("td")
                            .createEl("b", { text: header });
                    }

                    for (let i = 0; i < entry.inflection_table.left_headers.length; i++) {
                        const row = inflection_table_body.createEl("tr");
                        row
                            .createEl("td")
                            .createEl("b", { text: entry.inflection_table.left_headers[i] });

                        for (let j = 0; j < entry.inflection_table.top_headers.length; j++) {
                            let index = (i * entry.inflection_table.top_headers.length) + j

                            row.createEl("td", { text: entry.inflections[index] })
                        }
                    }

                    inflectionButton.onclick = (ev) => {
                        new InflectionModal(this.app, entry.inflection_table, entry.inflections, (result) => {
                            entry.inflection_table = JSON.parse(result)[0];
                            entry.inflections = JSON.parse(result)[1];
                            this.requestSave();
                            this.refresh();
                        }).open();
                    };


                    let fold_icon = inflection_card.createDiv({ cls: "inflection-fold is-collapsed" });
                    setIcon(fold_icon, 'chevron-down');


                    let inflection_contents = inflection_div
                        .createDiv({ cls: "inflection-contents" });

                    inflection_contents.setAttr("style", "display: none;");

                    inflection_contents.appendChild(inflection_table);

                    inflection_card.onclick = (ev) => {
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
                            this.refresh();
                        }
                    }).open();
                };

            }
        }
    }
}