# Open Any File Type in Browser

This VS Code extension allows you to open any local file in your preferred web browser directly from the editor. You can set your desired browser executable path and open files seamlessly.

## Features

- Open any local file in a web browser.
- Customizable browser executable path.
- Multi-language support: English and Simplified Chinese.

## Installation

1. Install the extension from the Visual Studio Code marketplace or clone this repository and debug it locally.
2. Open the Command Palette (Ctrl+Shift+P) and search for `Extensions: Install Extensions`.
3. Search for "Open Any File Type in Browser" and install it.

## Usage

1. Open a file in the editor.
2. Use the command `Open Any File Type in Browser: Open In Browser` from the Command Palette (Ctrl+Shift+P).
3. If a browser executable path is not set, you'll be prompted to select one for the first time.
4. You can also change the browser path later using the command `Open Any File Type in Browser: Choose Browser Path`.

## Configuration

You can configure the default browser path in the settings:

```json
"openAnyFileInBrowser.browserPath": "C:\\Path\\To\\Your\\Browser.exe"
```

## Localization

The extension supports English and Simplified Chinese. The displayed messages will change according to the set language in your VS Code configuration.

## License

This extension is licensed under the MIT License.

---

# 在浏览器中打开任何文件类型

此 VS Code 扩展允许您直接在编辑器中打开任何本地文件，使用您偏好的浏览器。您可以设置所需的浏览器可执行文件路径，轻松打开文件。

## 特性

- 在 web 浏览器中打开任何本地文件。
- 可自定义的浏览器可执行文件路径。
- 多语言支持：英语和简体中文。

## 安装

1. 从 Visual Studio Code 市场安装扩展，或克隆此存储库并在本地调试。
2. 打开命令面板（Ctrl+Shift+P），搜索 `Extensions: Install Extensions`。
3. 搜索 "在浏览器中打开任何文件类型" 并安装。

## 使用方法

1. 在编辑器中打开一个文件。
2. 使用命令 `在浏览器中打开任何文件类型：在浏览器中打开` 从命令面板中执行（Ctrl+Shift+P）。
3. 如果未设置浏览器可执行文件路径，您将在第一次运行时被提示选择一个。
4. 您还可以稍后使用命令 `在浏览器中打开任何文件类型：选择浏览器路径` 来更改浏览器路径。

## 配置

您可以在设置中配置默认的浏览器路径：

```json
"openAnyFileInBrowser.browserPath": "C:\\Path\\To\\Your\\Browser.exe"
```

## 本地化

该扩展支持英语和简体中文。显示的消息将根据您在 VS Code 配置中设置的语言进行更改。

## 许可证

该扩展根据 MIT 许可证发布。
