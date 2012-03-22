var testCapture = {
	"fsm.events.NoHandler": false,
	"fsm.events.Transitioned": false,
	"fsm.events.Handling": false,
	"fsm.events.Handled": false,
	"fsm.events.InvalidState": false,
	"fsm.events.CustomEvent": false,
	"fsm.events.Deferred": false,
	"fsm.events.OnEnter": false
};

QUnit.specify("machina.js integration with postal.js", function(){
	var fsm;
	describe("With custom FSM", function(){
		fsm = new machina.Fsm({
			initialState: "uninitialized",
			namespace: "myFsm",
			states: {
				"uninitialized" : {
					"event1" : function() {
						this.transition("initialized");
					},
					"event2" : function() {
						this.deferUntilTransition();
					}
				},
				"initialized" : {
					_onEnter: function() {
						this.fireEvent("OnEnter");
					},
					"event2" : function() {
						this.fireEvent("CustomEvent");
					},
					"event3" : function() {

					}
				}
			}
		});
		postal.subscribe({ channel: "myFsm", topic: "*", callback: function(data, envelope) {
			testCapture[envelope.topic] = true;
		}});
		postal.subscribe({ channel: "myFsm.events", topic: "*", callback: function(data, envelope) {
			testCapture[envelope.topic] = true;
		}});

		postal.publish({ channel: "myFsm", topic: "event21"});
		postal.publish({ channel: "myFsm", topic: "event2" });
		postal.publish({ channel: "myFsm", topic: "event1" });
		fsm.transition("NoSuchThing");

		it("should fire the Transitioned event", function(){
			assert(testCapture["Transitioned"]).equals(true);
		});
		it("should fire the NoHandler event", function(){
			assert(testCapture["NoHandler"]).equals(true);
		});
		it("should fire the Handling event", function(){
			assert(testCapture["Handling"]).equals(true);
		});
		it("should fire the Handled event", function(){
			assert(testCapture["Handled"]).equals(true);
		});
		it("should fire the CustomEvent event", function(){
			assert(testCapture["CustomEvent"]).equals(true);
		});
		it("should fire the OnEnter handler", function(){
			assert(testCapture["OnEnter"]).equals(true);
		});
		it("should fire the InvalidState handler", function(){
			assert(testCapture["InvalidState"]).equals(true);
		});
		it("should fire the Deferred handler", function(){
			assert(testCapture["Deferred"]).equals(true);
		});
	});
});