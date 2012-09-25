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
			try {
				bus.channels[eventChannel].publish( { topic : arguments[0], data : arguments[1] || {} } );
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
		bus.channels[handlerChannel] = postal.channel( { channel : handlerChannel } );
		bus.channels[eventChannel] = postal.channel( { channel : eventChannel } );
		bus.channels[handlerChannel]._subscriptions = [];
		bus.wireHandlersToBus( fsm, handlerChannel );
		bus.wireEventsToBus( fsm, eventChannel );
	}
};
machina.on( "newFsm", bus.wireUp );