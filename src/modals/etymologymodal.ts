import { App, MenuSeparator, Modal, setIcon, Setting } from "obsidian";

export class EtymologyModal extends Modal {
    original: {language: string, word: string, english: string, relationship: string}[];
    donations: {language: string, word: string, english: string, relationship: string}[];

    populateContent(content: HTMLDivElement) {
        content.empty();

        if (this.donations.length == 0) {
            content.createEl("div", { text: "Click the plus below to add an etymology donation", cls: "etymology-modal-section" } );
        }

        for (const [i, donation] of this.donations.entries()) {
            let section = content.createEl("div", { text: "Etymology Donation " + (i + 1), cls: "etymology-modal-section" } );
            new Setting(section)
                .setName('Language')
                .addText((text) => {
                    text.onChange((value) => {
                        donation.language = value;
                    });
                    text.setValue(this.original[i].language);
                });
            new Setting(section)
                .setName('Word')
                .addText((text) => {
                    text.onChange((value) => {
                        donation.word = value;
                    });
                    text.setValue(this.original[i].word);
                });
            new Setting(section)
                .setName('English')
                .addText((text) => {
                    text.onChange((value) => {
                        donation.english = value;
                    });
                    text.setValue(this.original[i].english);
                });
            new Setting(section)
                .setName('Relationship')
                .addDropdown((value) => {
                    value.onChange((value) => {
                        donation.relationship = value;
                    });
                    if (i == 0) {
                        value.addOption("root", "root");
                    } else {
                        value.addOption("concat", "concat (+)");
                        value.addOption("infix", "infix (<)");
                        value.addOption("suppletion", "suppletion (~)");
                        value.setValue(this.original[i].relationship);
                    }
                    
                });
        }
    }

    constructor(app: App, original: { language: string, word: string, english: string, relationship: string }[], onSubmit: (result: string) => void) {
        super(app);

        this.original = original;
        this.donations = original;

        this.setTitle('Edit Lexeme');

        let donation_content = this.contentEl.createEl("div", { cls: "etymology-donation-content" } );

        this.populateContent(donation_content);

        let management_content = this.contentEl.createEl("div", { cls: "etymology-management-content" } );

        let remove_button = management_content.createEl("button", { cls: "etymology-modal-button etymology-remove-button" } );
        setIcon(remove_button, 'minus');
        remove_button.onclick = (ev) => {
            this.donations.pop();
            this.populateContent(donation_content);
        }

        let add_button = management_content.createEl("button", { cls: "etymology-modal-button etymology-add-button" } );
        setIcon(add_button, 'plus');
        add_button.onclick = (ev) => {
            this.donations.push({language: "", word: "", english: "", relationship: ""})
            this.populateContent(donation_content);
        }

        let done_button = management_content.createEl("button", {  text: "Done", cls: " etymology-modal-button mod-cta etymology-done-button" } )

        done_button.onclick = (ev) => {
            this.close();
            onSubmit(JSON.stringify(this.donations));
        }
    }
}