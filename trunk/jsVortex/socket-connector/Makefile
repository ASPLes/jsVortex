# create key with
# >> keytool -genkey -alias aspl
# sign with
# >> jarsigner JavaSocketConnector.jar aspl


java_files = \
	JavaSocketConnector.java \
	SocketListener.java \
	BlockingQueue.java \
	Command.java \
	SocketCommand.java \
	LogHandling.java \
	SendCommand.java \
	InvokeCommand.java \
	Callers.java \
	JSCTrustManager.java \
	EnableTLSCommand.java \
	SocketState.java
class_files := $(patsubst %.java,%.class,$(wildcard *.java))

# configure plugin.jar location (browser plugin)
# the following will locate the file under the provided directory
plugin_jar = `find /usr/lib/jvm/java-6-sun* -name plugin.jar`

all:
        # compile source code
	javac -classpath $(plugin_jar) $(java_files)
        # create jar file
	jar cvf JavaSocketConnector.jar $(class_files)
sign:
        # sign the applet
	jarsigner JavaSocketConnector.jar aspl	
clean:
	rm -f *.class rm -f *.jar
