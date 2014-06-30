var testCapture = {};

var fsm;

describe( "With custom FSM", function () {
	before(function() {
		testCapture = {
			"nohandler"    : false,
			"transition"   : false,
			"handling"     : false,
			"handled"      : false,
			"invalidstate" : false,
			"CustomEvent"  : false,
			"deferred"     : false,
			"OnEnter"      : false
		};
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
						this.emit( "OnEnter" );
					},
					"event2" : function () {
						this.emit( "CustomEvent" );
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
	});

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
    var fsm2;
    var fsm2Events = {};

    before ( function () {
        fsm = new machina.Fsm({
            initialState: "uninitialized",
            namespace: "myFsmA",
            states: {
                "uninitialized": {
                    "event1": function () {
                        this.transition("initialized");
                    },
                    "event2": function () {
                        this.deferUntilTransition();
                    }
                },
                "initialized": {
                    _onEnter: function () {
                        this.emit("OnEnter");
                    },
                    "event2": function () {
                        this.emit("CustomEvent");
                    },
                    "event3": function () {

                    }
                }
            }
        });

        fsm2 = new machina.Fsm({
            initialState: "uninitialized",
            namespace: "myFsm2",
            states: {
                "uninitialized": {
                    "event1": function () {
                        fsm2Events.event1 = true;
                        this.transition("initialized");
                    },
                    "event2": function () {
                        this.deferUntilTransition();
                    }
                },
                "initialized": {
                    _onEnter: function () {
                        this.emit("OnEnter");
                    },
                    "event2": function () {
                        fsm2Events.event2 = true;
                        this.emit("CustomEvent");
                    },
                    "event3": function () {
                        fsm2Events.event3 = true;
                    }
                }
            }
        });

        postal.publish({channel: "myFsmA", topic: "event2"});
        postal.publish({channel: "myFsmA", topic: "event1"});
        fsm.transition("NoSuchThing");
    });

	it( "should NOT fire events in the second FSM the deferred handler", function () {
		expect( !!fsm2Events["event1"] ).to.be( false );
		expect( !!fsm2Events["event2"] ).to.be( false );
		expect( !!fsm2Events["event3"] ).to.be( false );
	} );
} );

describe( "When Removing Bus Integration", function() {
	before(function() {
		testCapture = {
			"nohandler"    : false,
			"transition"   : false,
			"handling"     : false,
			"handled"      : false,
			"invalidstate" : false,
			"CustomEvent"  : false,
			"deferred"     : false,
			"OnEnter"      : false
		};
		fsm = new machina.Fsm( {
			initialState : "uninitialized",
			namespace : "myFsmB",
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
						this.removeAllBusIntegration();
						this.emit( "OnEnter" );
					},
					"event2" : function () {
						this.emit( "CustomEvent" );
					},
					"event3" : function () {

					}
				}
			}
		} );
		postal.subscribe( { channel : "myFsmB", topic : "#", callback : function ( data, envelope ) {
			testCapture[envelope.topic] = true;
		}} );
		postal.subscribe( { channel : "myFsmB.events", topic : "#", callback : function ( data, envelope ) {
			testCapture[envelope.topic] = true;
		}} );

		postal.publish( { channel : "myFsmB", topic : "event21"} );
		postal.publish( { channel : "myFsmB", topic : "event2" } );
		postal.publish( { channel : "myFsmB", topic : "event1" } );
		fsm.transition( "NoSuchThing" );
	});

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
	it( "should NOT fire the CustomEvent event", function () {
		expect( testCapture["CustomEvent"] ).to.be( false );
	} );
	it( "should NOT fire the OnEnter handler", function () {
		expect( testCapture["OnEnter"] ).to.be( false );
	} );
	it( "should fire the invalidstate handler", function () {
		expect( testCapture["invalidstate"] ).to.be( false );
	} );
	it( "should fire the deferred handler", function () {
		expect( testCapture["deferred"] ).to.be( true );
	} );
});

describe( "When Opting Out of Bus Integration", function() {
	before(function() {
		testCapture = {
			"nohandler"    : false,
			"transition"   : false,
			"handling"     : false,
			"handled"      : false,
			"invalidstate" : false,
			"CustomEvent"  : false,
			"deferred"     : false,
			"OnEnter"      : false
		};
		fsm = new machina.Fsm( {
			_noBus: true,
			initialState : "uninitialized",
			namespace : "myFsmC",
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
						this.removeAllBusIntegration();
						this.emit( "OnEnter" );
					},
					"event2" : function () {
						this.emit( "CustomEvent" );
					},
					"event3" : function () {

					}
				}
			}
		} );
		postal.subscribe( { channel : "myFsmC", topic : "#", callback : function ( data, envelope ) {
			testCapture[envelope.topic] = true;
		}} );
		postal.subscribe( { channel : "myFsmC.events", topic : "#", callback : function ( data, envelope ) {
			testCapture[envelope.topic] = true;
		}} );

		postal.publish( { channel : "myFsmC", topic : "event21"} );
		postal.publish( { channel : "myFsmC", topic : "event2" } );
		postal.publish( { channel : "myFsmC", topic : "event1" } );
		fsm.transition( "NoSuchThing" );
	});

	it( "should fire the transition event", function () {
		expect( testCapture["transition"] ).to.be( false );
	} );
	it( "should fire the nohandler event", function () {
		expect( testCapture["nohandler"] ).to.be( false );
	} );
	it( "should fire the handling event", function () {
		expect( testCapture["handling"] ).to.be( false );
	} );
	it( "should fire the handled event", function () {
		expect( testCapture["handled"] ).to.be( false );
	} );
	it( "should NOT fire the CustomEvent event", function () {
		expect( testCapture["CustomEvent"] ).to.be( false );
	} );
	it( "should NOT fire the OnEnter handler", function () {
		expect( testCapture["OnEnter"] ).to.be( false );
	} );
	it( "should fire the invalidstate handler", function () {
		expect( testCapture["invalidstate"] ).to.be( false );
	} );
	it( "should fire the deferred handler", function () {
		expect( testCapture["deferred"] ).to.be( false );
	} );
});

describe( "When specifying custom channels as a string", function() {
    before(function() {
        testCapture = {
            "nohandler"    : false,
            "transition"   : false,
            "handling"     : false,
            "handled"      : false,
            "invalidstate" : false,
            "CustomEvent"  : false,
            "deferred"     : false,
            "OnEnter"      : false
        };
        fsm = new machina.Fsm( {
            handlerChannel: 'myHandlerChannel',
            eventChannel: 'myEventChannel',
            initialState : "uninitialized",
            namespace : "myFsmC",
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
                        this.emit( "OnEnter" );
                    },
                    "event2" : function () {
                        this.emit( "CustomEvent" );
                    },
                    "event3" : function () {

                    }
                }
            }
        } );
        postal.subscribe( { channel : "myHandlerChannel", topic : "#", callback : function ( data, envelope ) {
            testCapture[envelope.topic] = true;
        }} );
        postal.subscribe( { channel : "myEventChannel", topic : "#", callback : function ( data, envelope ) {
            testCapture[envelope.topic] = true;
        }} );

        postal.publish( { channel : "myHandlerChannel", topic : "event21"} );
        postal.publish( { channel : "myHandlerChannel", topic : "event2" } );
        postal.publish( { channel : "myHandlerChannel", topic : "event1" } );
        fsm.transition( "NoSuchThing" );
    });

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
});


describe( "When specifying custom channels directly", function() {
    before(function() {
        testCapture = {
            "nohandler"    : false,
            "transition"   : false,
            "handling"     : false,
            "handled"      : false,
            "invalidstate" : false,
            "CustomEvent"  : false,
            "deferred"     : false,
            "OnEnter"      : false
        };
        fsm = new machina.Fsm( {
            handlerChannel: postal.channel('myHandlerChannel'),
            eventChannel: postal.channel('myEventChannel'),
            initialState : "uninitialized",
            namespace : "myFsmC",
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
                        this.emit( "OnEnter" );
                    },
                    "event2" : function () {
                        this.emit( "CustomEvent" );
                    },
                    "event3" : function () {

                    }
                }
            }
        } );
        postal.subscribe( { channel : "myHandlerChannel", topic : "#", callback : function ( data, envelope ) {
            testCapture[envelope.topic] = true;
        }} );
        postal.subscribe( { channel : "myEventChannel", topic : "#", callback : function ( data, envelope ) {
            testCapture[envelope.topic] = true;
        }} );

        postal.publish( { channel : "myHandlerChannel", topic : "event21"} );
        postal.publish( { channel : "myHandlerChannel", topic : "event2" } );
        postal.publish( { channel : "myHandlerChannel", topic : "event1" } );
        fsm.transition( "NoSuchThing" );
    });

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
});

