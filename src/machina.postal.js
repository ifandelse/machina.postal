(function ( root, factory ) {
	if ( typeof module === "object" && module.exports ) {
		// Node, or CommonJS-Like environments
		module.exports = function ( machina,postal ) {
			return factory( machina, postal );
		}
	} else if ( typeof define === "function" && define.amd ) {
		// AMD. Register as an anonymous module.
		define( ["machina", "postal"], function ( machina, postal ) {
			return factory( machina, postal, root );
		} );
	} else {
		// Browser globals
		factory( root.machina, root.postal, root );
	}
}( this, function ( machina, postal, global, undefined ) {

	//import("adapter.js");

} ));
