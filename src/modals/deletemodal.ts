import { App, Modal, Setting } from "obsidian";

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