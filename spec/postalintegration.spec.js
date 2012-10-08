var testCapture = {
	"fsm.events.nohandler" : false,
	"fsm.events.transitioned" : false,
	"fsm.events.handling" : false,
	"fsm.events.handled" : false,
	"fsm.events.invalidstate" : false,
	"fsm.events.CustomEvent" : false,
	"fsm.events.deferred" : false,
	"fsm.events.OnEnter" : false
};

QUnit.specify( "machina.js integration with postal.js", function () {
	var fsm;
	describe( "With custom FSM", function () {
		fsm = new machina.Fsm( {
			initialState : "uninitialized",
			namespace : "myFsm",
			states : {
				"uninitialized" : {
					"event1" : function () {
						this.transition( "initialized" );
					},
					"event2" : function () {
						this.deferUntilTransition();
					}
				},
				"initialized" : {
					_onEnter : function () {
						this.fireEvent( "OnEnter" );
					},
					"event2" : function () {
						this.fireEvent( "CustomEvent" );
					},
					"event3" : function () {

					}
				}
			}
		} );
		postal.subscribe( { channel : "myFsm", topic : "#", callback : function ( data, envelope ) {
			testCapture[envelope.topic] = true;
		}} );
		postal.subscribe( { channel : "myFsm.events", topic : "#", callback : function ( data, envelope ) {
			testCapture[envelope.topic] = true;
		}} );

		postal.publish( { channel : "myFsm", topic : "event21"} );
		postal.publish( { channel : "myFsm", topic : "event2" } );
		postal.publish( { channel : "myFsm", topic : "event1" } );
		fsm.transition( "NoSuchThing" );

		it( "should fire the transition event", function () {
			assert( testCapture["transition"] ).equals( true );
		} );
		it( "should fire the nohandler event", function () {
			assert( testCapture["nohandler"] ).equals( true );
		} );
		it( "should fire the handling event", function () {
			assert( testCapture["handling"] ).equals( true );
		} );
		it( "should fire the handled event", function () {
			assert( testCapture["handled"] ).equals( true );
		} );
		it( "should fire the CustomEvent event", function () {
			assert( testCapture["CustomEvent"] ).equals( true );
		} );
		it( "should fire the OnEnter handler", function () {
			assert( testCapture["OnEnter"] ).equals( true );
		} );
		it( "should fire the invalidstate handler", function () {
			assert( testCapture["invalidstate"] ).equals( true );
		} );
		it( "should fire the deferred handler", function () {
			assert( testCapture["deferred"] ).equals( true );
		} );
	} );
} );