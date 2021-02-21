chrome.contextMenus.create({
    id: "iconid",
    title: "Generate Reference",
    contexts: ["all"],
    onclick: menuOnClickGenerateReference
});  