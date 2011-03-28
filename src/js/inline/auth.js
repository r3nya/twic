/**
 * Inline script to get user PIN code
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

( function() {

	var
		// todo write something for selectors
		pinElement  = twic.dom.find('#oauth_pin'),
		idElement   = twic.dom.find('meta[name=session-userid]');

	if (!pinElement) {
		return;
	}

	var
		pin = parseInt(pinElement.innerText, 10),
		userId = parseInt(idElement['content'], 10);

	if (
		!pin
		|| !userId
	) {
		// parse int from the page failed
		return;
	}

	/**
	 * Change the pinned text
	 * @param {string} i18nKey Key for localization
	 */
	var changePinText = function(i18nKey) {
		pinElement.innerText = twic.utils.lang.translate(i18nKey);
	};

	twic.debug.info('Pin code: ' + pin);

	pinElement.classList.add('mini');
	changePinText('auth_in_progress');

	twic.requests.send('accountAuth', {
		'pin':  pin,
		'user_id': userId
	}, function(reply) {
		if (
			!reply['res']
			|| twic.global.FAILED === reply['res']
		) {
			changePinText('auth_failed');
			return;
		}

		var res = reply['res'];

		if (twic.global.SUCCESS === res) {
			// success
			changePinText('auth_success');
		} else
		if (twic.global.AUTH_ALREADY === res) {
			// already authenticated
			changePinText('auth_already');
		}
	} );

}() );
