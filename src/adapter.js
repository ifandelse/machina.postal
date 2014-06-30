	machina.Fsm.prototype.removeBusPublishing = function() {
        this.off("*", this._bus.channels[this._bus.eventChannel].eventPublisher);
    };

    machina.Fsm.prototype.removeBusSubscriptions = function() {
        var subs = this._bus.channels[this._bus.handlerChannel]._subscriptions;
        while(subs.length) {
            subs.pop().unsubscribe();
        }
    };

    machina.Fsm.prototype.removeAllBusIntegration = function() {
        this.removeBusSubscriptions();
        this.removeBusPublishing();
    };

    var bus = machina.bus = {

        config: {
            handlerChannelSuffix: "",
            eventChannelSuffix: ".events"
        },

        wireHandlersToBus: function (fsm, handlerChannel) {
            fsm._bus.channels[handlerChannel]._subscriptions.push(
                fsm._bus.channels[handlerChannel].subscribe("#", function (data, envelope) {
                    fsm.handle.call(fsm, envelope.topic, data, envelope);
                })
            );
        },

        wireEventsToBus: function (fsm, eventChannel) {
            var publisher = fsm._bus.channels[eventChannel].eventPublisher = function () {
                var args = Array.prototype.slice.call(arguments, 0);
                var handler = args[0].toLowerCase();
                try {
                    fsm._bus.channels[eventChannel].publish(args[0], args[1]);
                } catch (exception) {
                    if (console && typeof console.log !== "undefined") {
                        console.log(exception.toString());
                    }
                }
            };
            fsm.on("*", publisher);
        },

        wireUp: function (fsm) {
            function getChannel(channelOption, channelTypeSuffix) {
                if (channelOption && _.isFunction(channelOption.publish) && _.isFunction(channelOption.subscribe)) {
                    return { name: channelOption.channel, channel: channelOption}
                }
                else if(!_.isString(channelOption)) {
                    channelOption = fsm.namespace + channelTypeSuffix;
                }
                return { name: channelOption, channel: postal.channel(channelOption) };
            }
            if (fsm._noBus) {
                return;
            }
            var handlerChannel = getChannel(fsm.handlerChannel, this.config.handlerChannelSuffix),
                eventChannel = getChannel(fsm.eventChannel, this.config.eventChannelSuffix);
            fsm._bus = {
                handlerChannel: handlerChannel.name,
                eventChannel: eventChannel.name,
                channels: {}
            };
            fsm._bus.channels[handlerChannel.name] = handlerChannel.channel;
            fsm._bus.channels[eventChannel.name] = eventChannel.channel;
            fsm._bus.channels[handlerChannel.name]._subscriptions = [];
            this.wireHandlersToBus(fsm, handlerChannel.name);
            this.wireEventsToBus(fsm, eventChannel.name);
        }
    };

    machina.on("newfsm", function(fsm) { bus.wireUp(fsm); });

    return machina;