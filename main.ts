import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { LexiconView, VIEW_TYPE_LEXICON } from "./views/lexiconview"


interface LexiconSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: LexiconSettings = {
	mySetting: 'default'
}

export default class Lexicon extends Plugin {
	settings: LexiconSettings;

	async onload() {
		await this.loadSettings();

		this.registerView(
			VIEW_TYPE_LEXICON,
			  (leaf: WorkspaceLeaf) => new LexiconView(leaf)
		  );
		  this.registerExtensions(["lexicon"], VIEW_TYPE_LEXICON);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: Lexicon;

	constructor(app: App, plugin: Lexicon) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
