# vscode-ctrl-tab-fuzzy

Fuzzy search tab list, via extension.fuzzyTab.

## Known limitations
- Reopened files from a previous session have to be manually activated once, before appearing in the list.
- Non file buffers are filtered out by looking for a ".", so files that don't have a "." in their name won't show up in the list. Logically, non file buffers like "Settings" won't show up either.
- Code might be subpar, I don't know anything about vscode extensions, so I let ChatGPT write it.