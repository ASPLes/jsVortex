dependencies = {
	layers : [
	    /**
	     * name ouput script as dojo.js to assamble all content of
	     * the dependencies and dojo.js itself as pointed by:
	     * http://www.dojotoolkit.org/forum/dojo-core-dojo-0-9/dojo-core-support/custom-build-issues-dojo-not-defined
	     */
            { name: "dojo.js",
              dependencies: [
                  "dojo",
		  "dojo.parser",
		  "dijit.layout.ContentPane",
		  "dijit.layout.BorderContainer",
		  "dijit.form.ValidationTextBox",
		  "dijit.form.Button",
		  "dijit.form.CheckBox"
              ]
	    }
        ],
        prefixes: [
	    ["dijit", "../dijit"]
        ]
};