function VortexChannel (connection,
			num,
			profile,
			receivedHandler,
			closeHandler) {

    this.connection      = connection;
    this.num             = num;
    this.profile         = profile;
    this.receivedHandler = receivedHandler;
    this.closeHandler    = closeHandler;
}

