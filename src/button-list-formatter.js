function formatButtonListObject(rawButtonList) {
    const returnObject = {
        pages: [],
        faders: []
    }

    rawButtonList.buttons.page.forEach((page) => {
        const pageObject = {
            name: page.$.name,
            columns: page.$.columns,
            columnButtons: {},
            buttons: []
        }
        var col = 1;
        while (col <= pageObject.columns) {
            pageObject.columnButtons[col] = page.$['colbuttons_' + col];
            col++;
        }
        page.button.forEach((button) => {
            console.log(button)
            pageObject.buttons.push({
                name: button['_'],
                index: Number(button.$.index),
                flash: Boolean(Number(button.$.flash)),
                pressed: Boolean(Number(button.$.pressed)),
                line: Number(button.$.line),
                column: Number(button.$.column),
                color: button.$.color
            });
        });
        returnObject.pages.push(pageObject);
    });
    rawButtonList.buttons.fader.forEach((fader) => {
        returnObject.faders.push({
            name: fader['_'],
            value: Number(fader.$.value)
        });
    });
    return returnObject;
}

module.exports = {
    format: formatButtonListObject
};
