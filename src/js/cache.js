/**
 * Cache object
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.cache = { };

/**
 * @constructor
 * @private
 */
twic.cache.cacheElement_ = function() {
	this.expires = 0;
	this.value = null;
};

/**
 * Key-value storage
 * @private
 * @var {Object.<twic.cache.cacheElement_>}
 */
twic.cache.storage_ = { };

/**
 * Set the key value
 * @param {string} key Key
 * @param {*} value Value
 * @param {number=} expires Expires in (sec)
 */
twic.cache.set = function(key, value, expires) {
	var
		element = null;

	if (key in twic.cache.storage_) {
		element = twic.cache.storage_[key];
	} else {
		element = new twic.cache.cacheElement_();
		twic.cache.storage_[key] = element;
	}

	element.expires = expires === 0 ? 0 : goog.now() + expires * 1000;
	element.value = value;
};

/**
 * Get the value from cache
 * @param {string} key Key
 * @return {*}
 */
twic.cache.get = function(key) {
	if (!(key in twic.cache.storage_)) {
		return null;
	}

	var
		element = twic.cache.storage_[key];

	if (
		element.expires > 0
		&& element.expires < goog.now()
	) {
		delete twic.cache.storage_[key];
		return null;
	}

	return element.value;
};

/**
 * Autocleaner for cache
 */
twic.cache.gc_ = function() {
	var
		key = '',
		element = null,
		n = goog.now();

	for (key in twic.cache.storage_) {
		element = twic.cache.storage_[key];

		if (
			element.expires > 0
			&& element.expires < n
		) {
			delete twic.cache.storage_[key];
		}
	}
};

setInterval(twic.cache.gc_, 1000 * 60 * 10);







