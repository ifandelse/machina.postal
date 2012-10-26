var testCapture = {
	"fsm.events.nohandler" : false,
	"fsm.events.transition" : false,
	"fsm.events.handling" : false,
	"fsm.events.handled" : false,
	"fsm.events.invalidstate" : false,
	"fsm.events.CustomEvent" : false,
	"fsm.events.deferred" : false,
	"fsm.events.OnEnter" : false
};

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
		expect( testCapture["transition"] ).to.be( true );
	} );
	it( "should fire the nohandler event", function () {
		expect( testCapture["nohandler"] ).to.be( true );
	} );
	it( "should fire the handling event", function () {
		expect( testCapture["handling"] ).to.be( true );
	} );
	it( "should fire the handled event", function () {
		expect( testCapture["handled"] ).to.be( true );
	} );
	it( "should fire the CustomEvent event", function () {
		expect( testCapture["CustomEvent"] ).to.be( true );
	} );
	it( "should fire the OnEnter handler", function () {
		expect( testCapture["OnEnter"] ).to.be( true );
	} );
	it( "should fire the invalidstate handler", function () {
		expect( testCapture["invalidstate"] ).to.be( true );
	} );
	it( "should fire the deferred handler", function () {
		expect( testCapture["deferred"] ).to.be( true );
	} );
} );

describe( "With Multiple FSMs", function () {
	fsm = new machina.Fsm( {
		initialState : "uninitialized",
		namespace : "myFsmA",
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

	var fsm2Events = {};

	var fsm2 = new machina.Fsm( {
		initialState : "uninitialized",
		namespace : "myFsm2",
		states : {
			"uninitialized" : {
				"event1" : function () {
					fsm2Events.event1 = true;
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
					fsm2Events.event2 = true;
					this.fireEvent( "CustomEvent" );
				},
				"event3" : function () {
					fsm2Events.event3 = true;
				}
			}
		}
	} );

	postal.publish( { channel : "myFsmA", topic : "event2" } );
	postal.publish( { channel : "myFsmA", topic : "event1" } );
	fsm.transition( "NoSuchThing" );

	it( "should NOT fire events in the second FSM the deferred handler", function () {
		expect( !!fsm2Events["event1"] ).to.be( false );
		expect( !!fsm2Events["event2"] ).to.be( false );
		expect( !!fsm2Events["event3"] ).to.be( false );
	} );
} );