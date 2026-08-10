import { App, Modal, setIcon, Setting, SettingGroup } from "obsidian";
import { Settings } from "../views/lexiconview";
import { ParadigmModal } from "./paradigmmodal";
import { DeleteModal } from "./deletemodal";

export class ConfigureModal extends Modal {
    tabs: HTMLElement;
    content: HTMLElement;
    save: () => void;

    constructor(app: App, settings: Settings, save: () => void) {
        super(app);

        this.save = save;

        this.modalEl.addClass("lexicon-configurator");

        let container = this.contentEl.createDiv({ cls:"vertical-tabs-container" });

        this.tabs = container.createDiv("lexicon-configurator-tabs");

        let content_container = container.createDiv("lexicon-configurator-content-container");
        content_container.createDiv({ cls: "lexicon-configurator-titlebar" }).createDiv({ cls: "modal-title" }).setText("Configure Lexicon");

        this.content = content_container.createDiv("lexicon-configurator-content");

        let search_tab = this.tabs.createDiv({cls: "vertical-tab-nav-item"})
        setIcon(search_tab.createDiv({ cls: "vertical-tab-nav-item-icon" }), "search");
        search_tab.createDiv({ cls: "vertical-tab-nav-item-title" }).setText("Search");
        search_tab.onClickEvent(() => {
            this.set_active_tab(search_tab);
            let features_group = new SettingGroup(this.content)
                .setHeading("Features")
                .addSetting((setting) => {
                    setting
                        .setName("Ignore diacritics")
                        .setDesc("Include results with different diacritics than the query")
                        .addToggle((toggle) => {
                            toggle
                                .setValue(settings.search.ignore_diacritics)
                                .onChange((value) => {
                                    settings.search.ignore_diacritics = value;
                                    this.save();
                                })
                        });
                })
                .addSetting((setting) => {
                    setting
                        .setName("Ignore case")
                        .setDesc("Include results with different capitalization than the query")
                        .addToggle((toggle) => {
                            toggle
                                .setValue(settings.search.ignore_case)
                                .onChange((value) => {
                                    settings.search.ignore_case = value;
                                    this.save();
                                })
                        });
                });
        });

        let inflections_tab = this.tabs.createDiv({cls: "vertical-tab-nav-item"});
        setIcon(inflections_tab.createDiv({ cls: "vertical-tab-nav-item-icon" }), "table");
        inflections_tab.createDiv({ cls: "vertical-tab-nav-item-title" }).setText("Inflections");
        inflections_tab.onClickEvent(() => {
            this.set_active_tab(inflections_tab);
            
            let paradigm_group = new SettingGroup(this.content)
                .setHeading("Paradigms")
                .addExtraButton((btn) => {
                    btn
                        .setIcon("plus")
                        .setTooltip("Add Paradigm")
                        .onClick(() => {
                            new ParadigmModal(app, "", {top_headers: [], left_headers: []}, [], settings.inflections.inflection_paradigms, (name, inflection_table, inflections) => {
                                settings.inflections.inflection_paradigms[name] = {table: inflection_table, inflections: inflections};
                                this.save();
                                this.render_paradigms(app, settings, paradigm_group);
                            }).open();
                        });
                });

            this.render_paradigms(app, settings, paradigm_group);
        });

        let placeholder = this.content.createDiv({ cls: "lexicon-configurator-placeholder" });
        setIcon(placeholder, "arrow-left");
        placeholder.createSpan("lexicon-configurator-placeholder-label").setText("Select a tab to configure features");
    }

    render_paradigms(app: App, settings: Settings, setting_group: SettingGroup) {
        setting_group.listEl.empty();
        if (Object.entries(settings.inflections.inflection_paradigms).length == 0) {
            setting_group.addSetting((setting) => {
                setting.setDesc("Click the + button to add a paradigm");
            })
        } else {
            for (const paradigm of Object.entries(settings.inflections.inflection_paradigms)) {
                setting_group.addSetting((setting) => {
                    setting
                        .setName(paradigm[0])
                        .addExtraButton((btn) => {
                            btn
                                .setIcon("pencil")
                                .setTooltip("Edit")
                                .onClick(() => {
                                    new ParadigmModal(app, paradigm[0], paradigm[1].table, paradigm[1].inflections, settings.inflections.inflection_paradigms, (name, inflection_table, inflections) => {
                                        delete settings.inflections.inflection_paradigms[paradigm[0]];
                                        settings.inflections.inflection_paradigms[name] = { table: inflection_table, inflections: inflections };
                                        this.save();
                                        this.render_paradigms(app, settings, setting_group);
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
                                            delete settings.inflections.inflection_paradigms[paradigm[0]];
                                            this.save();
                                            this.render_paradigms(app, settings, setting_group)
                                        }
                                    })).open();
                                })
                        });
                })
            }
        }
    }

    set_active_tab(tab: HTMLDivElement) {
        for (let i = 0; i < this.tabs.children.length; i++) {
                this.tabs.children[i].removeClass("is-active");
        }
        tab.addClass("is-active");
        this.content.empty();
    }
}