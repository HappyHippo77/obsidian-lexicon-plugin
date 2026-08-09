import { App, Modal, Setting } from "obsidian";

export class DeleteModal extends Modal {
    constructor(app: App, title: string, warning: string, onSubmit: (confirm: boolean) => void) {
        super(app);
        this.setTitle(title);
        this.setContent(warning);

        let buttons = new Setting(this.contentEl)
        buttons
            .addButton((btn) =>
                btn
                    .setButtonText('Cancel')
                    .onClick(() => {
                        this.close();
                        onSubmit(false);
                    }));
        buttons
            .addButton((btn) =>
                btn
                    .setButtonText('Delete')
                    .setDestructive()
                    .onClick(() => {
                        this.close();
                        onSubmit(true);
                    }));
    }
}