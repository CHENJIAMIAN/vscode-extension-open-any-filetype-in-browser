import * as fs from 'fs'; 
import * as iconv from 'iconv-lite';
import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

// Define a type for localization
type LocalizationStrings = {
    noFileOpen: string;
    onlyLocalFiles: string;
    invalidBrowserPath: string;
    selectExeFile: string;
    fileOpenError: string;
    unexpectedError: string;
    openingFileInBrowser: string; // New entry for opening file message.
};

// Define the struct for the entire localization object
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
        openingFileInBrowser: `Opening "%s" in Browser.` // New entry for opening file message.
    },
    ["zh-cn"]: {
        noFileOpen: "没有打开文件可在浏览器中打开。",
        onlyLocalFiles: "只能在浏览器中打开本地文件。",
        invalidBrowserPath: "无效的 浏览器 可执行文件路径，请检查路径是否存在。",
        selectExeFile: "请选择浏览器可执行文件。",
        fileOpenError: "打开文件失败：",
        unexpectedError: "意外错误：",
        openingFileInBrowser: `在 浏览器 中打开 "%s".` // New entry for opening file message.
    }
};

/**
 * Get localized message
 */
function getLocalizedString(key: keyof LocalizationStrings): string {
    const language = vscode.env.language as 'en' | 'zh-cn'; // Explicitly type to your supported languages
    // Now TypeScript knows that language will be either 'en' or 'zh'
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

                const defaultBrowserPath = `C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe`;
                if (await fileExists(defaultBrowserPath)) {
                    browserPath = defaultBrowserPath;
                } else {
                    const selectedFileUri = await vscode.window.showOpenDialog({
                        canSelectFiles: true,
                        canSelectFolders: false,
                        canSelectMany: false,
                        title: getLocalizedString('selectExeFile'),
                        filters: {
                            'Executables': ['exe']
                        }
                    });

                    if (!selectedFileUri || selectedFileUri.length === 0) {
                        vscode.window.showErrorMessage(getLocalizedString('selectExeFile'));
                        return;
                    }
                    browserPath = selectedFileUri[0].fsPath;
                }

                if (!await fileExists(browserPath)) {
                    vscode.window.showErrorMessage(getLocalizedString('invalidBrowserPath'));
                    return;
                }

                async function fileExists(filePath: string): Promise<boolean> {
                    return new Promise((resolve) => {
                        fs.access(filePath, fs.constants.F_OK, (err) => {
                            resolve(!err);
                        });
                    });
                }

                exec(`"${browserPath}" "${filePath}"`, (error, stdout, stderr) => {
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

    context.subscriptions.push(disposable);
}