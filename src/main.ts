import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, WorkspaceLeaf } from 'obsidian';
import { LexiconView, VIEW_TYPE_LEXICON } from "./views/lexiconview"
import * as path from 'path';


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

		// Add an entry to the file-explorer context menu to create a new lexicon
		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				const parent = file instanceof TFile ? file.parent : file;

				menu.addItem((item) => {
					item
					.setTitle('New Lexicon')
					.setIcon('book-a')
					.onClick(async () => {
						if (parent) {
							const {vault} = this.app;
							const {adapter} = vault;
							let filePath = parent.path + "/New Lexicon.lexicon";
							try {
								const fileExists = await adapter.exists(filePath);
								if (fileExists)
									new Notice(`${filePath} already exists`);
					
								const File = await vault.create(filePath, '[]');
								const leaf = this.app.workspace.getLeaf(true);
								await leaf.openFile(File);
							} catch (error) {
								console.log(error.toString());
							}
						}
					});
				});
			})
		);
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
