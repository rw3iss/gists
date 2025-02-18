import EventBus from "eventbusjs";
import { getLogger, LogModule } from "lib/utils/logging.js";
import safeStringify from 'safe-stringify';
import { getWindowSize, makeResizable } from "components/shared/BlobEditor/lib/utils/domUtils.js";
import { JsonView } from "components/shared/BlobEditor/lib/JsonView.js";

const { log, warn } = getLogger('DebugPanel', { color: 'red', enabled: true });

type LogEntry = {
    id: string;
    message: Array<any> | object | string;
    timestamp: Date;
}

type LogEvent = {
    namespace: string;
    args: Array<any>;
}

interface TabEntries {
    [namespace: string]: LogEntry[];
}

// Wrapping class to use the DebugPanel within the Logging framework.
export class DebugPanelLogModule implements LogModule {
    public name = "DebugPanel";
    public debugPanel: DebugPanel;

    constructor(opts: any = {}) {
        this.debugPanel = new DebugPanel(document.body);
        if (opts.show) this.debugPanel.show();
    }

    public onLog(log: LogEvent) {
        this.debugPanel.addLog(log.namespace, log.args);
    }
}

function renderLogEntry(message: any) {
    return Array.isArray(message) ?
        message.join(' ') :
        typeof message == 'object' ?
            safeStringify(message) :
            `${message}`;
}

// send state to debug panel to show as JSON view.
const DEBUG_STATE_NAMESPACE = 'objects';
export function debugState(id, state) {
    // get log modules?
    EventBus.dispatch('debug-state', { id, state });
}

export class DebugPanel {
    private container: HTMLElement;
    private tabContainer: HTMLElement;
    private contentContainer: HTMLElement;
    private tabEntries: TabEntries = {};
    private debugStates = {};
    private activeTab: string = "global";

    constructor(parent: HTMLElement) {
        this.container = this.createContainer();
        this.tabContainer = this.createTabContainer();
        this.contentContainer = this.createContentContainer();

        this.container.appendChild(this.tabContainer);
        this.container.appendChild(this.contentContainer);
        parent.appendChild(this.container);

        this.addTab(DEBUG_STATE_NAMESPACE);
        this.addTab("global");

        this.setupResizable();
        this.setupEventListeners();
    }

    private createContainer(): HTMLElement {
        const container = document.createElement("div");
        container.classList.add("debug-panel");
        return container;
    }

    private createTabContainer(): HTMLElement {
        const tabContainer = document.createElement("div");
        tabContainer.classList.add("debug-panel-tabs");
        return tabContainer;
    }

    private createContentContainer(): HTMLElement {
        const contentContainer = document.createElement("div");
        contentContainer.classList.add("debug-panel-content");
        return contentContainer;
    }

    private setupResizable() {
        const { width, height } = getWindowSize();

        makeResizable(this.container, {
            handles: ['left', 'top', 'top-left'],
            maxWidth: width - 20,
            maxHeight: height - 20,
            minWidth: 200,
            minHeight: 150
            //onResize: (width, height) => console.log(`Resized: ${width}x${height}`)
        });
    }

    private setupEventListeners(): void {
        EventBus.addEventListener("log", (event: any) => {
            const { namespace, message } = event.target;
            this.addLog(namespace, message);
        });
        EventBus.addEventListener("debug-state", (event: any) => {
            const { id, state } = event.target;
            if (!id || !state) return console.log("Invalid event data for debug-state. Expected {id,state}, got:", event);
            this.handleDebugState(id, state);
        });
    }

    // display an object for debugging.
    private handleDebugState(id: string, state: any) {

        const safeState = safeStringify(state);
        state = JSON.parse(safeState);

        const updateDebugState = (id, state) => {
            //console.log(`update debug`, id, state);
            const content = this.contentContainer.querySelector(
                `[data-namespace=${DEBUG_STATE_NAMESPACE}]`
            );
            if (!content) return console.error("No content for debug namespace.");
            const debugWrapper: HTMLElement | null = content.querySelector(`#debug-state-${id}`);
            if (!debugWrapper) return console.error(`No debug state found for ${id}.`);
            const jsonWrapper = debugWrapper.querySelector('.json-wrapper');
            if (!jsonWrapper) return console.error(`No json wrapper found for existing state ${id}`);
            //debugElement.innerText = printJson(state);
            jsonWrapper.innerHTML = '';
            this.debugStates[id].state = state;
            this.debugStates[id].jsonView.updateJson(state);
            // const tree = jsonTree.create(state, jsonWrapper);
            // tree.expand();
            //log(`updated debug state`, debugWrapper);
        }

        const addDebugState = (id, state) => {
            //console.log(`add debug`, id, state)
            const content = this.contentContainer.querySelector(
                `[data-namespace=${DEBUG_STATE_NAMESPACE}]`
            );
            if (!content) return console.error("No content for debug namespace.");

            // create debug state
            const debugWrapper = document.createElement('div');
            debugWrapper.classList.add('debug-state');
            debugWrapper.setAttribute('id', `debug-state-${id}`);

            const toggleButton = document.createElement("button");
            toggleButton.classList.add("json-toggle");
            toggleButton.textContent = '[-]';
            toggleButton.onclick = () => {
                const isCollapsed = debugWrapper.classList.contains("collapsed");
                debugWrapper.classList.toggle("collapsed", !isCollapsed);
                toggleButton.textContent = isCollapsed ? "[-]" : "[+]";
            };
            debugWrapper.appendChild(toggleButton);

            const label = document.createElement("div");
            label.classList.add('debug-state-label');
            label.innerText = `${id}`;
            debugWrapper.appendChild(label);

            const jsonWrapper = document.createElement('div');
            jsonWrapper.classList.add('json-wrapper');
            debugWrapper.appendChild(jsonWrapper);

            const jsonView = new JsonView(state, jsonWrapper as HTMLElement,
                {
                    expandObjs: [
                        /children/,
                        /children\/(.*)/,
                        /entry/
                    ]
                }
            );
            this.debugStates[id] = { state, jsonView };

            // const tree = jsonTree.create(state, jsonWrapper);
            // tree.expand();
            content.appendChild(debugWrapper);

            //log(`added debug state`, debugWrapper);
        }

        //log(`DEBUG STATE:`, id, state);
        if (this.debugStates[id]) updateDebugState(id, state);
        else addDebugState(id, state);
    }

    private addTab(namespace: string): void {
        if (this.tabEntries[namespace]) return;

        this.tabEntries[namespace] = [];

        const tab = document.createElement("button");
        tab.classList.add("debug-tab");
        tab.textContent = namespace;
        tab.onclick = () => this.switchTab(namespace);
        this.tabContainer.appendChild(tab);

        const content = document.createElement("div");
        content.classList.add("debug-tab-content");
        content.dataset.namespace = namespace;
        this.contentContainer.appendChild(content);

        if (namespace === "global") {
            this.addClearButton(content, true);
        } else {
            this.addClearButton(content);
        }

        if (Object.keys(this.tabEntries).length === 1) {
            this.switchTab(namespace);
        }
    }

    private switchTab(namespace: string): void {
        this.activeTab = namespace;
        document
            .querySelectorAll(".debug-tab-content")
            .forEach((el) => (el as HTMLElement).style.display = "none");
        const activeContent = this.contentContainer.querySelector(
            `[data-namespace="${namespace}"]`
        ) as HTMLElement;
        if (activeContent) activeContent.style.display = "block";
    }

    private addClearButton(content: HTMLElement, isGlobal: boolean = false): void {
        const clearButton = document.createElement("button");
        clearButton.classList.add("debug-clear-button");
        clearButton.textContent = "Clear";
        clearButton.onclick = () => {
            if (isGlobal) {
                Object.keys(this.tabEntries).forEach((key) => {
                    this.tabEntries[key] = [];
                    const tabContent = this.contentContainer.querySelector(
                        `[data-namespace="${key}"]`
                    );
                    if (tabContent) tabContent.innerHTML = "";
                });
            } else {
                const namespace = content.dataset.namespace;
                if (namespace) {
                    if (namespace == DEBUG_STATE_NAMESPACE) {
                        this.debugStates = {};
                    } else {
                        content.innerHTML = "";
                        this.tabEntries[namespace] = [];
                    }
                }
            }
        };
        content.appendChild(clearButton);
    }

    public addLog(namespace: string, message: Array<any> | object | string): void {
        if (!this.tabEntries[namespace]) {
            this.addTab(namespace);
        }

        const logEntry: LogEntry = {
            id: `${namespace}-${Date.now()}-${Math.random()}`,
            message,
            timestamp: new Date(),
        };
        this.tabEntries[namespace].push(logEntry);

        const content = this.contentContainer.querySelector(
            `[data-namespace="${namespace}"]`
        );
        if (!content) return;

        const logElement = this.createLogElement(logEntry, namespace);
        content.appendChild(logElement);

        // add to global
        if (namespace != 'global') this.addLog('global', message);
    }

    private createLogElement(logEntry: LogEntry, namespace: string): HTMLElement {
        const logElement = document.createElement("div");
        logElement.classList.add("debug-log-entry");
        logElement.dataset.logId = logEntry.id;

        // Add text:
        const logText = document.createElement('div');
        logText.innerText = `[${logEntry.timestamp.toLocaleTimeString()}] ${renderLogEntry(logEntry.message)}`;
        logText.classList.add('debug-log-entry-text');

        // Add 'Copy' button
        const copyButton = document.createElement('button');
        copyButton.innerText = '📋';
        copyButton.classList.add('debug-copy-button');
        copyButton.onclick = () => navigator.clipboard.writeText(logText.innerHTML);

        // Add 'X' (delete) button
        const deleteButton = document.createElement('button');
        deleteButton.innerText = '❌';
        deleteButton.classList.add('debug-delete-button');
        deleteButton.onclick = () => this.removeLogEntry(namespace, logEntry.id, logElement);

        logElement.appendChild(logText);
        logElement.appendChild(copyButton);
        logElement.appendChild(deleteButton);

        return logElement;
    }

    private removeLogEntry(namespace: string, logId: string, logElement: HTMLElement): void {
        this.tabEntries[namespace] = this.tabEntries[namespace].filter(
            (entry) => entry.id !== logId
        );
        logElement.remove();
    }

    public show(): void {
        //console.log(`SHOW`)
        this.container.classList.add("visible");
    }

    public hide(): void {
        this.container.classList.remove("visible");
    }
}