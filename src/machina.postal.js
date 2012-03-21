//import("VersionHeader.js");
(function(root, doc, factory) {
	if (typeof define === "function" && define.amd) {
		// AMD. Register as an anonymous module.
		define(["machina", "postal"], function(machina, postal) {
			return factory(machina, postal, root, doc);
		});
	} else {
		// Browser globals
		factory(root.machina, root.postal, root, doc);
	}
}(this, document, function(machina, postal, global, document, undefined) {

	//import("adapter.js");

}));