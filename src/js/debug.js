/**
 * All work with console object is refactored to strip it
 * while compiling (closure compiler with defines)
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.debug = { };

/**
 * @define {boolean}
 */
twic.debug.ENABLED = true;

/**
 * @param {...*} args
 */
twic.debug.log = function(args) {
	if (!twic.debug.ENABLED) {
		return;
	}

	console.log.apply(console, arguments);
};

/**
 * @param {...*} args
 */
twic.debug.info = function(args) {
	if (!twic.debug.ENABLED) {
		return;
	}

	console.info.apply(console, arguments);
};

/**
 * @param {...*} args
 */
twic.debug.group = function(args) {
	if (!twic.debug.ENABLED) {
		return;
	}

	console.group.apply(console, arguments);
};

/**
 * @param {...*} args
 */
twic.debug.groupCollapsed = function(args) {
	if (!twic.debug.ENABLED) {
		return;
	}

	console.groupCollapsed.apply(console, arguments);
};

/**
 * @param {...*} args
 */
twic.debug.error = function(args) {
	if (!twic.debug.ENABLED) {
		return;
	}

	// print the trace to track the error source
	console.trace();
	console.error.apply(console, arguments);
};

/**
 * @param {...*} args
 */
twic.debug.dir = function(args) {
	if (!twic.debug.ENABLED) {
		return;
	}

	console.dir.apply(console, arguments);
};

twic.debug.groupEnd = function() {
	if (!twic.debug.ENABLED) {
		return;
	}

	console.groupEnd.apply(console);
};
