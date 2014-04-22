var bus = machina.bus = {
	channels : {},
	config : {
		handlerChannelSuffix : "",
		eventChannelSuffix : ".events"
	},
	wireHandlersToBus : function ( fsm, handlerChannel ) {
		bus.channels[handlerChannel]._subscriptions.push(
			bus.channels[handlerChannel].subscribe( "#", function ( data, envelope ) {
				fsm.handle.call( fsm, envelope.topic, data, envelope );
			} )
		);
	},
	wireEventsToBus : function ( fsm, eventChannel ) {
		var publisher = bus.channels[eventChannel].eventPublisher = function () {
			var args = Array.prototype.slice.call( arguments, 0 );
			var handler = args[0].toLowerCase();
			try {
				bus.channels[eventChannel].publish( args[0], args[1] );
			} catch ( exception ) {
				if ( console && typeof console.log !== "undefined" ) {
					console.log( exception.toString() );
				}
			}
		};
		fsm.on( "*", publisher );
	},
	wireUp : function ( fsm ) {
		var handlerChannel = fsm.namespace + bus.config.handlerChannelSuffix,
			eventChannel = fsm.namespace + bus.config.eventChannelSuffix;
		bus.channels[handlerChannel] = postal.channel( handlerChannel );
		bus.channels[eventChannel] = postal.channel( eventChannel );
		bus.channels[handlerChannel]._subscriptions = [];
		bus.wireHandlersToBus( fsm, handlerChannel );
		bus.wireEventsToBus( fsm, eventChannel );
	}
};
machina.on( "newfsm", bus.wireUp );