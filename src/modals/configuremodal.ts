import { App, Modal, setIcon, Setting, SettingGroup } from "obsidian";
import { Data, InflectionParadigm, LexiconView } from "../views/lexiconview";
import { ParadigmModal } from "./paradigmmodal";
import { DeleteModal } from "./deletemodal";

export class ConfigureModal extends Modal {
    tabs: HTMLElement;
    content: HTMLElement;

    constructor(app: App, view: LexiconView) {
        super(app);

        this.modalEl.addClass("lexicon-configurator");

        let container = this.contentEl.createDiv({ cls:"vertical-tabs-container" });

        this.tabs = container.createDiv("lexicon-configurator-tabs");

        let content_container = container.createDiv("lexicon-configurator-content-container");
        content_container.createDiv({ cls: "lexicon-configurator-titlebar" }).createDiv({ cls: "modal-title" }).setText("Configure Lexicon");

        this.content = content_container.createDiv("lexicon-configurator-content");

        let inflection_paradigms_button = this.tabs.createDiv({cls: "vertical-tab-nav-item"});
        setIcon(inflection_paradigms_button.createDiv({ cls: "vertical-tab-nav-item-icon" }), "table");
        inflection_paradigms_button.createDiv({ cls: "vertical-tab-nav-item-title" }).setText("Inflections");
        inflection_paradigms_button.onClickEvent(() => {
            this.switch(inflection_paradigms_button);
            
            let paradigm_group = new SettingGroup(this.content)
                .setHeading("Paradigms")
                .addExtraButton((btn) => {
                    btn
                        .setIcon("plus")
                        .setTooltip("Add Paradigm")
                        .onClick(() => {
                            new ParadigmModal(app, false, "", {top_headers: [], left_headers: []}, [], view.jsonData.inflection_paradigms, (name, inflection_table, inflections) => {
                                view.jsonData.inflection_paradigms[name] = {table: inflection_table, inflections: inflections};
                                view.requestSave();
                                this.render_paradigms(app, view, paradigm_group);
                            }).open();
                        });
                });

            this.render_paradigms(app, view, paradigm_group);
        });

        let placeholder_button = this.tabs.createDiv({cls: "vertical-tab-nav-item"})
        setIcon(placeholder_button.createDiv({ cls: "vertical-tab-nav-item-icon" }), "x");
        placeholder_button.createDiv({ cls: "vertical-tab-nav-item-title" }).setText("Placeholder");
        placeholder_button.onClickEvent(() => {
            this.switch(placeholder_button);
            let placeholder = this.content.createDiv({ cls: "lexicon-configurator-placeholder" });
            setIcon(placeholder, "x");
            placeholder.createSpan("lexicon-configurator-placeholder-label").setText("Nothing here...")
        });

        let placeholder = this.content.createDiv({ cls: "lexicon-configurator-placeholder" });
        setIcon(placeholder, "arrow-left");
        placeholder.createSpan("lexicon-configurator-placeholder-label").setText("Select a tab to configure features");
    }

    render_paradigms(app: App, view: LexiconView, setting_group: SettingGroup) {
        setting_group.listEl.empty();
        if (Object.entries(view.jsonData.inflection_paradigms).length == 0) {
            setting_group.addSetting((setting) => {
                setting.setDesc("Click the + button to add a paradigm");
            })
        } else {
            for (const paradigm of Object.entries(view.jsonData.inflection_paradigms)) {
                setting_group.addSetting((setting) => {
                    setting
                        .setName(paradigm[0])
                        .addExtraButton((btn) => {
                            btn
                                .setIcon("pencil")
                                .setTooltip("Edit")
                                .onClick(() => {
                                    new ParadigmModal(app, true, paradigm[0], paradigm[1].table, paradigm[1].inflections, view.jsonData.inflection_paradigms, (name, inflection_table, inflections) => {
                                        view.jsonData.inflection_paradigms[name] = { table: inflection_table, inflections: inflections };
                                        view.requestSave();
                                        this.render_paradigms(app, view, setting_group);
                                    }).open();
                                });
                        })
                        .addExtraButton((btn) => {
                            btn
                                .setIcon("trash-2")
                                .setTooltip("Delete")
                                .onClick(() => {
                                    new DeleteModal(app, "Delete Paradigm", "Are you sure you want to delete this paradigm?", (confirm => {
                                        if (confirm) {
                                            delete view.jsonData.inflection_paradigms[paradigm[0]];
                                            view.requestSave();
                                            this.render_paradigms(app, view, setting_group)
                                        }
                                    })).open();
                                })
                        });
                })
            }
        }
    }

    switch(tab: HTMLDivElement) {
        for (let i = 0; i < this.tabs.children.length; i++) {
                this.tabs.children[i].removeClass("is-active");
        }
        tab.addClass("is-active");
        this.content.empty();
    }
}