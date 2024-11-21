import * as fs from 'fs'; 
import * as iconv from 'iconv-lite';
import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

type LocalizationStrings = {
    noFileOpen: string;
    onlyLocalFiles: string;
    invalidBrowserPath: string;
    selectExeFile: string;
    fileOpenError: string;
    unexpectedError: string;
    openingFileInBrowser: string; 
    browserPathUpdated: string; 
};

type Localization = {
    en: LocalizationStrings;
    ["zh-cn"]: LocalizationStrings;
};

const localization: Localization = {
    en: {
        noFileOpen: "No file is currently open to open in browser.",
        onlyLocalFiles: "Only local files can be opened in the browser.",
        invalidBrowserPath: "Invalid Browser executable path, please check if the path exists.",
        selectExeFile: "Please select the browser executable file.",
        fileOpenError: "Failed to open file: ",
        unexpectedError: "Unexpected error: ",
        openingFileInBrowser: `Opening "%s" in Browser.`, 
        browserPathUpdated: "Browser path updated to: %s", 
    },
    ["zh-cn"]: {
        noFileOpen: "没有打开文件可在浏览器中打开。",
        onlyLocalFiles: "只能在浏览器中打开本地文件。",
        invalidBrowserPath: "无效的 浏览器 可执行文件路径，请检查路径是否存在。",
        selectExeFile: "请选择浏览器可执行文件。",
        fileOpenError: "打开文件失败：",
        unexpectedError: "意外错误：",
        openingFileInBrowser: `在 浏览器 中打开 "%s".`, 
        browserPathUpdated: "浏览器路径已更新为：%s", 
    }
};

/**
 * Get localized message
 */
function getLocalizedString(key: keyof LocalizationStrings): string {
    const language = vscode.env.language as 'en' | 'zh-cn'; 
    return localization[language][key] || localization['en'][key]; 
}

/**
 * 激活扩展
 */
export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'open-any-filetype-in-browser.openInBrowser',
        async (uri: vscode.Uri) => {
            try {
                let fileUri = uri;
                if (!fileUri) {
                    const activeEditor = vscode.window.activeTextEditor;
                    if (!activeEditor) {
                        vscode.window.showErrorMessage(getLocalizedString('noFileOpen'));
                        return;
                    }
                    fileUri = activeEditor.document.uri;
                }

                if (fileUri.scheme !== 'file') {
                    vscode.window.showErrorMessage(getLocalizedString('onlyLocalFiles'));
                    return;
                }

                const filePath = fileUri.fsPath;
                const fileName = path.basename(filePath);
                let browserPath: string;

                const config = vscode.workspace.getConfiguration('openAnyFileInBrowser');
                const storedBrowserPath = config.get<string>('browserPath') || '';

                if (storedBrowserPath && await fileExists(storedBrowserPath)) {
                    browserPath = storedBrowserPath;
                } else {
                    let defaultBrowserPath: string=`C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`;

                    // Set default browser path based on the operating system
                    if (process.platform === 'win32') {
                        defaultBrowserPath = `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`;
                    } else if (process.platform === 'darwin') {
                        defaultBrowserPath = `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`;
                    } else if (process.platform === 'linux') {
                        defaultBrowserPath = `/usr/bin/google-chrome`;
                    }

                    if (await fileExists(defaultBrowserPath)) {
                        browserPath = defaultBrowserPath;
                    } else {
                        const selectedFileUri = await vscode.window.showOpenDialog({
                            canSelectFiles: true,
                            canSelectFolders: false,
                            canSelectMany: false,
                            title: getLocalizedString('selectExeFile'),
                            filters: {
                                'Executables': ['exe', 'app'] // Added 'app' for macOS
                            }
                        });

                        if (!selectedFileUri || selectedFileUri.length === 0) {
                            vscode.window.showErrorMessage(getLocalizedString('selectExeFile'));
                            return;
                        }
                        browserPath = selectedFileUri[0].fsPath;

                        await config.update('browserPath', browserPath, vscode.ConfigurationTarget.Global);
                    }
                }

                if (!await fileExists(browserPath)) {
                    const result = await vscode.window.showErrorMessage(getLocalizedString('invalidBrowserPath'), { modal: true }, 'Choose New Path');
                    if (result === 'Choose New Path') {
                        chooseBrowserPathCommand();
                    }
                    return;
                }

                async function fileExists(filePath: string): Promise<boolean> {
                    return new Promise((resolve) => {
                        fs.access(filePath, fs.constants.F_OK, (err) => {
                            resolve(!err);
                        });
                    });
                }

                let execCommand = `"${browserPath}" "${filePath}"`;

                // For Linux and Mac, append '&' to run the command in the background
                if (process.platform === 'linux' || process.platform === 'darwin') {
                    execCommand = `${execCommand} &`;
                }

                exec(execCommand, (error, stdout, stderr) => {
                    if (error) {
                        const decodedMessage = iconv.decode(Buffer.from(error.message, 'binary'), 'utf-8');
                        console.error(`Error: ${decodedMessage}`);
                        vscode.window.showErrorMessage(
                            getLocalizedString('fileOpenError') + decodedMessage
                        );
                        return;
                    }
                    if (stderr) {
                        console.error(`Stderr: ${stderr}`);
                        return;
                    }
                    console.log(`Stdout: ${stdout}`);
                    const message = getLocalizedString('openingFileInBrowser').replace('%s', fileName);
                    vscode.window.showInformationMessage(message);
                });
            } catch (error) {
                const err = error as Error;
                console.error('Error stack:', err.stack);
                vscode.window.showErrorMessage(
                    getLocalizedString('unexpectedError') + error
                );
            }
        }
    );

    const chooseBrowserPathCommand = async () => {
        const selectedFileUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            title: getLocalizedString('selectExeFile'),
            filters: {
                'Executables': ['exe', 'app'] // Added 'app' for macOS
            }
        });

        if (!selectedFileUri || selectedFileUri.length === 0) {
            vscode.window.showErrorMessage(getLocalizedString('selectExeFile'));
            return;
        }

        const newBrowserPath = selectedFileUri[0].fsPath;
        const config = vscode.workspace.getConfiguration('openAnyFileInBrowser');
        await config.update('browserPath', newBrowserPath, vscode.ConfigurationTarget.Global);
        const message = getLocalizedString('browserPathUpdated').replace('%s', newBrowserPath);
        vscode.window.showInformationMessage(message);
    };

    context.subscriptions.push(disposable);
    context.subscriptions.push(vscode.commands.registerCommand('open-any-filetype-in-browser.chooseBrowserPath', chooseBrowserPathCommand));
}