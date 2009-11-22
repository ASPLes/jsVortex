# create key with
# >> keytool -genkey -alias aspl
# sign with
# >> jarsigner JavaSocketConnector.jar aspl


java_files = \
	JavaSocketConnector.java \
	SocketListener.java \
	BlockingQueue.java \
	Command.java \
	SocketCommand.java
class_files := $(patsubst %.java,%.class,$(wildcard *.java))

all:
        # compile source code
	javac -classpath /usr/lib/jvm/java-6-sun-1.6.0.12/jre/lib/plugin.jar $(java_files)
        # create jar file
	jar cvf JavaSocketConnector.jar $(class_files)
clean:
	rm -f *.class rm -f *.jar
