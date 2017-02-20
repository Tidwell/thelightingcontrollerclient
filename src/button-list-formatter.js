function formatButtonListObject(rawButtonList) {
    const returnObject = {
        pages: [],
        faders: []
    };
    
    if (rawButtonList.buttons && rawButtonList.buttons.page) {
        rawButtonList.buttons.page.forEach((page) => {
            if (!page.$) { return; }
            const pageObject = {
                name: page.$.name,
                columns: page.$.columns,
                columnButtons: {},
                buttons: []
            }
            var col = 1;
            while (col <= pageObject.columns) {
                if (page.$['colbuttons_' + col]) {
                    pageObject.columnButtons[col] = page.$['colbuttons_' + col];
                }
                col++;
            }
            if (page.button && page.button.length) {
                page.button.forEach((button) => {
                    if (!button.$) { return; }
                    pageObject.buttons.push({
                        name: button['_'] || '',
                        index: Number(button.$.index),
                        flash: Boolean(Number(button.$.flash)),
                        pressed: Boolean(Number(button.$.pressed)),
                        line: Number(button.$.line),
                        column: Number(button.$.column),
                        color: button.$.color
                    });
                });
            }
            returnObject.pages.push(pageObject);
        });
    }
    if (rawButtonList.buttons && rawButtonList.buttons.fader) {
        rawButtonList.buttons.fader.forEach((fader) => {
            if (!fader.$) { return; }
            returnObject.faders.push({
                name: fader['_'],
                value: Number(fader.$.value)
            });
        });
    }
    return returnObject;
}

module.exports = {
    format: formatButtonListObject
};
