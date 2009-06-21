function menuClicked () {
    console.log ("Menu clicked!!");
    return;
}

function installNiceClick () {

    /* find all a references */
    var list = dojo.query('div.buttons-menu');

    /* connect on click */
    dojo.connect (list[0], "click", menuClicked);

    return;
}

function installPageFunctions () {

    /* install nice click */
    installNiceClick ();

    return;
}

/* register our function in dojo */
dojo.addOnLoad (installPageFunctions);