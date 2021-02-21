/**
 * Method invoked when end user use the context menu button to generate template
 * from the current active tab.
 * @param {*} info 
 * @param {*} tabs 
 */
function menuOnClickGenerateReference(info, tab) {
    showReferenceTemplateUser(tab);
};


function generateReferenceTemplateString(tab) {
    if (!tab) return; // Don't call method if tab is null or undefined
}

function showReferenceTemplateUser(tab){
    const templateString = generateReferenceTemplateString(tab);
}
