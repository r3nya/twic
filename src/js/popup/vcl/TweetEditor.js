/**
 * Tweet editor
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// todo holy shit! reorder it

/**
 * @constructor
 * @param {number} userId User identifier (used to store backup textarea value)
 * @param {Element} parent Parent element
 * @param {string=} replyTo Identifier of reply to tweet
 */
twic.vcl.TweetEditor = function(userId, parent, replyTo) {

	var
		editor = this,
		/** @type {Storage} **/ storage         = window.localStorage,
		/** @type {Element} **/ editorWrapper   = twic.dom.expandElement('div.tweetEditor'),
		/** @type {Element} **/ editorSend      = twic.dom.expandElement('input'),
		/** @type {Element} **/ editorAttach    = twic.dom.expandElement('img'),
		/** @type {Element} **/ rightButtons    = twic.dom.expandElement('div.rb'),
		/** @type {Element} **/ editorCounter   = twic.dom.expandElement('span'),
		/** @type {Element} **/ clearer         = twic.dom.expandElement('div.clearer'),
		/** @type {number}  **/ charCount       = 0;

	/** @type {boolean} **/ editor.autoRemovable = false;

	/**
	 * @type {string}
	 */
	this.constStartVal_ = '';

	this.suggestBlock_ = twic.dom.expandElement('div');

	/**
	 * @type {Element}
	 * @private
	 */
	this.editorTextarea_ = twic.dom.expandElement('textarea');

	this.editorTextarea_['spellcheck'] = false;
	this.editorTextarea_.placeholder = twic.utils.lang.translate(replyTo ? 'placeholder_tweet_reply' : 'placeholder_tweet_new');

	// @resource img/buttons/attach.png
	editorAttach.src = 'img/buttons/attach.png';
	editorAttach.classList.add('attach');

	if (!twic.vcl.TweetEditor.prototype.currentURL_) {
		editorAttach.title = twic.utils.lang.translate('title_attach_link_disabled');

		editorAttach.classList.add('disabled');
	} else {
		editorAttach.title = twic.utils.lang.translate('title_attach_link');
	}

	editorSend.type  = 'button';
	editorSend.value = twic.utils.lang.translate(replyTo ? 'button_reply' : 'button_send');
	editorSend.title = twic.utils.lang.translate('title_button_send');

	rightButtons.appendChild(editorAttach);
	rightButtons.appendChild(editorSend);

	editorWrapper.appendChild(this.editorTextarea_);
	editorWrapper.appendChild(this.suggestBlock_);

	editorWrapper.appendChild(editorCounter);
	editorWrapper.appendChild(rightButtons);
	editorWrapper.appendChild(clearer);

	if (parent.childElementCount > 0) {
		parent.insertBefore(editorWrapper, parent.firstChild);
	} else {
		parent.appendChild(editorWrapper);
	}

	if (twic.vcl.TweetEditor.prototype.currentURL_) {
		editorAttach.addEventListener('click', function() {
			var
				url = twic.vcl.TweetEditor.prototype.currentURL_,
				selStart = editor.editorTextarea_.selectionStart,
				selEnd = editor.editorTextarea_.selectionEnd,
				newVal = editor.editorTextarea_.value.substr(0, selStart);

			if (
				newVal.length > 0
				&& ' ' !== newVal.substr(-1)
			) {
				newVal += ' ';
			}

			newVal += url;

			if (' ' !== editor.editorTextarea_.value.substr(selEnd).substr(0, 1)) {
				newVal += ' ';
			}

			selStart = newVal.length;

			newVal += editor.editorTextarea_.value.substr(selEnd);

			editor.editorTextarea_.value = newVal;

			editor.editorTextarea_.selectionStart = selStart;
			editor.editorTextarea_.selectionEnd = selStart;

			editor.editorTextarea_.focus();
		}, false );
	}

	var checkTweetArea = function() {
		var val = editor.editorTextarea_.value;

		if (editorWrapper.classList.contains(twic.vcl.TweetEditor.sendingClass)) {
			return;
		}

		if (val.substring(0, editor.constStartVal_.length) !== editor.constStartVal_) {
			editor.editorTextarea_.value = editor.constStartVal_;
			editor.editorTextarea_.selectionStart = editor.editorTextarea_.selectionEnd = editor.constStartVal_.length;
			val = editor.constStartVal_;
		}

		charCount = val.length;

		while (
			editor.editorTextarea_.rows > 1
			&& editor.editorTextarea_.scrollHeight <= editor.editorTextarea_.offsetHeight
		) {
			--editor.editorTextarea_.rows;
		}

		while (editor.editorTextarea_.scrollHeight > editor.editorTextarea_.offsetHeight) {
			++editor.editorTextarea_.rows;
		}

		editorCounter.innerHTML = (twic.vcl.TweetEditor.MAXCOUNT - charCount).toString();

		if (charCount > twic.vcl.TweetEditor.MAXCOUNT) {
			editorWrapper.classList.add(twic.vcl.TweetEditor.overloadClass);
		} else {
			editorWrapper.classList.remove(twic.vcl.TweetEditor.overloadClass);
		}

		editorSend.disabled = (
			charCount === 0
			|| charCount > twic.vcl.TweetEditor.MAXCOUNT
			|| val === editor.constStartVal_
		);
	};

	/**
	 * Try to send the tweet
	 */
	var tryToSend = function() {
		/** @type {string} **/ var val = editor.editorTextarea_.value;

		if (val.length > 0) {
			// loading state

			editorWrapper.classList.add(twic.vcl.TweetEditor.sendingClass);
			editorCounter.innerHTML = '&nbsp;';
			editorSend.disabled = true;

			editor.onTweetSend(editor, val, replyTo, function() {
				editor.reset();

				if (editor.autoRemovable) {
					editor.close();
				}
			} );
		}
	};

	/**
	 * Function to get the path to localStorage element
	 * @return {string}
	 */
	var getStoragePath = function() {
		// todo append the tweet id if editor is for composing the reply
		return 'tweetEditor_' + userId + (replyTo ? '_' + replyTo : '');
	};

	// store the textarea value on each keyup to avoid data loss on popup close
	this.editorTextarea_.addEventListener('keyup', function(e) {
		if (13 === e.keyCode) {
			return false;
		}

		var
			val  = editor.editorTextarea_.value,
			path = getStoragePath();

		checkTweetArea();

		if (
			val === ''
			|| val === editor.constStartVal_
			|| val.length < editor.constStartVal_.length
		) {
			storage.removeItem(path);
		} else {
			storage.setItem(path, val);
		}
	}, false );

	// prevent user to press enter
	this.editorTextarea_.addEventListener('keydown', function(e) {
		switch (e.keyCode) {
			// enter
			case 13:
				e.preventDefault();

				if (e.ctrlKey) {
					e.stopPropagation();

					if (
						charCount > 0
						&& charCount < 141
					) {
						tryToSend();
					}
				}

				break;
		}
	}, false );

	var handleOutClick = function(e) {
		if (
			editorWrapper.classList.contains(twic.vcl.TweetEditor.focusedClass)
			&& !twic.dom.isChildOf(e.target, editorWrapper)
		) {
			editorWrapper.classList.remove(twic.vcl.TweetEditor.focusedClass);
		}
	};

	this.editorTextarea_.addEventListener('focus', function(e) {
		editorWrapper.classList.add(twic.vcl.TweetEditor.focusedClass);
		checkTweetArea();

		editor.onFocus();
	}, false );

	editorSend.addEventListener('click', function() {
		tryToSend();
	}, false );

	var reset = function() {
		editor.editorTextarea_.value = '';
		editor.editorTextarea_.rows = 1;
		editor.editorTextarea_.blur();

		editorCounter.innerHTML = twic.vcl.TweetEditor.MAXCOUNT.toString();

		editorWrapper.classList.remove(twic.vcl.TweetEditor.focusedClass);
		editorWrapper.classList.remove(twic.vcl.TweetEditor.sendingClass);
	};

	document.addEventListener('click', handleOutClick, false);

	// init

	reset();

	var backupText = storage.getItem(getStoragePath());
	if (backupText) {
		this.editorTextarea_.value = backupText;
		// fixme ugly timeout to resize textarea after ui is loaded
		setTimeout( function() {
			checkTweetArea();
		}, 200);
	}

	// functions

	editor.reset = function() {
		// empty the localstorage backup
		storage.removeItem(getStoragePath());

		reset();
	};

	editor.close = function() {
		document.removeEventListener('click', handleOutClick, false);

		twic.dom.removeElement(editorWrapper);

		editor.onClose();
	};

	var suggest = new twic.vcl.Suggest(this);
    suggest.onSelect = function() {
        checkTweetArea();
    };
};

/**
 * Current url to paste it into the tweet
 * @private
 */
twic.vcl.TweetEditor.prototype.currentURL_ = false;

chrome.tabs.getSelected( null, function(tab) {
	if (tab) {
		var
			url = tab.url.trim();

		if (
			url.length > 4
			&& (
				'http' === url.substr(0, 4)
				|| 'ftp' === url.substr(0, 3)
			)
		) {
			if ('/' === url.substr(-1)) {
				url = url.substring(0, url.length - 1);
			}

			twic.vcl.TweetEditor.prototype.currentURL_ = url;
		}
	}
} );

// ------------------------------------------

/** @const **/ twic.vcl.TweetEditor.overloadClass = 'overload',
/** @const **/ twic.vcl.TweetEditor.focusedClass  = 'focused',
/** @const **/ twic.vcl.TweetEditor.sendingClass  = 'sending';
/** @const **/ twic.vcl.TweetEditor.MAXCOUNT = 140;

/**
 * @param {boolean=} setstart Set the cursor to the start
 */
twic.vcl.TweetEditor.prototype.setFocus = function(setstart) {
	this.editorTextarea_.selectionStart = setstart ? 0 : this.editorTextarea_.selectionEnd = this.editorTextarea_.value.length;
	this.editorTextarea_.focus();
};

/**
 * Set the editor text
 * @param {string} text Tweet text
 */
twic.vcl.TweetEditor.prototype.setText = function(text) {
	this.constStartVal_ = '';
	this.editorTextarea_.value = text;
};

/**
 * Set the constant editor text
 * @param {string} text Constant tweet part
 */
twic.vcl.TweetEditor.prototype.setConstTextIfEmpty = function(text) {
	if (this.editorTextarea_.value === '') {
		this.constStartVal_ = text;
		this.editorTextarea_.value = text;
	}
};

/**
 * Get the suggest place
 * @return {Element}
 */
twic.vcl.TweetEditor.prototype.getSuggestBlock = function() {
	return this.suggestBlock_;
};

/**
 * Get the textarea
 * @return {Element}
 */
twic.vcl.TweetEditor.prototype.getTextarea = function() {
	return this.editorTextarea_;
};

/**
 * Handler for tweet send process
 * @param {twic.vcl.TweetEditor} editor Editor
 * @param {string} tweetText Tweet text
 * @param {string=} replyTo Reply to tweet
 * @param {function()=} callback Callback for reset
 */
twic.vcl.TweetEditor.prototype.onTweetSend = function(editor, tweetText, replyTo, callback) { };

/**
 * Handler for the focus event
 */
twic.vcl.TweetEditor.prototype.onFocus = function() { };

/**
 * Close handler for tweet editor
 */
twic.vcl.TweetEditor.prototype.onClose = function() { };

/**
 * Get the suggest list
 * @param {string} startPart Start part of the nick
 * @param {function(Array)} callback Callback function
 */
twic.vcl.TweetEditor.prototype.onGetSuggestList = function(startPart, callback) {
	callback( [ ] );
};
