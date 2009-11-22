/**
 ** Copyright (C) 2009 Advanced Software Production Line, S.L.
 ** See license.txt or http://www.aspl.es/vortex
 **/
import java.util.*;
public class BlockingQueue {
	/* The store used to queue elements */
	private final LinkedList<Object> queue = new LinkedList<Object>();
	/**
	 * Push an item into the queue.
	 * @param o The object to be pushed.
	 */
	public void push (Object o) {
		synchronized (queue) {
			queue.add(o);
			queue.notify();
		}
		return;
	}
	
	/**
	 * Lock the caller until some item is available.
	 *
	 * @return An object from the queue.
	 */
	public Object pop() throws InterruptedException {
		synchronized (queue) {
			while (queue.isEmpty()) {
				queue.wait();
			}
			return queue.removeFirst();
		}
	}
}
