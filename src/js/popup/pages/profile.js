/**
 * Profile page implementation
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

// todo annotations
( function() {

	var
		page,
		elementLoader,
		elementAvatar,
		elementName,
		elementNick,
		elementUrl,
		elementFollowings,
		elementFollowed,
		elementFollowedSpan,
		timelineUserId,
		profileUserId,
		loader,
		toolbarTimeline;

	var initPage = function() {
		page              = document.getElementById('profile');

		elementFollowings   = document.getElementById('followings');
		elementFollowed     = elementFollowings.querySelector('p');
		elementFollowedSpan = elementFollowings.querySelector('span');

		elementLoader   = page.querySelector('.loader');
		elementAvatar   = page.querySelector('.avatar');
		elementName     = page.querySelector('.name');
		elementNick     = page.querySelector('.nick');
		elementUrl      = page.querySelector('.url');
		toolbarTimeline = page.querySelector('.toolbar a');
	};

	var clearProfileData = function() {
		elementFollowedSpan.className = '';
		elementFollowed.className = '';
		elementLoader.style.display = 'block';
		elementAvatar.style.display = 'none';
		elementFollowings.style.display = 'none';
		elementAvatar.src = '';
		elementName.innerHTML = '';
		elementNick.innerHTML = '';
		elementUrl.innerHTML = '';
	};

	var follow = function() {
		elementFollowedSpan.className = 'loading';

		twic.requests.send('follow', {
			'id': timelineUserId,
			'whom_id': profileUserId
		}, function() {
			showProfileFriendship(true);
		} );
	};

	var unfollow = function() {
		elementFollowedSpan.className = 'loading';

		twic.requests.send('unfollow', {
			'id': timelineUserId,
			'whom_id': profileUserId
		}, function() {
			showProfileFriendship(false);
		} );
	};

	var showProfileFriendship = function(following) {
		elementFollowedSpan.className = '';

		if (following) {
			elementFollowed.className = 'following';
			elementFollowed.onclick = unfollow;
		} else {
			elementFollowed.className = '';
			elementFollowed.onclick = follow;
		}

		elementFollowings.style.display = 'block';
	};

	var showProfile = function(data) {
		profileUserId = data['id'];

		// fixme shitcode
		elementAvatar.src = data['avatar'];
		elementAvatar.title = '@' + data['screen_name'];
		elementAvatar.style.display = '';
		elementName.innerHTML = data['name'];
		elementNick.innerHTML = data['screen_name'];
		elementUrl.innerHTML = '<a href="' + data['url'] + '" target="_blank">' + data['url'] + '</a>';

		if (
			!timelineUserId
			|| timelineUserId === data['id']
		) {
			elementLoader.style.display = 'none';
		} else {
			twic.requests.send('getProfileFriendshipInfo', {
				'source_id': timelineUserId,
				'target_id': data['id']
			}, function(data) {
				elementLoader.style.display = 'none';
				showProfileFriendship(data['following']);
				elementFollowings.style.display = 'block';
			} );
		}
	};

	twic.router.handle('profile', function(data) {
		var
			router = this,
			prev = router.previous(),
			/** @type {string} **/ prevPage = prev.shift(),
			/** @type {string} **/ userName;

		router.initOnce(initPage);

		toolbarTimeline.href = '#' + prevPage;

		if (prevPage === 'about') {
			toolbarTimeline.innerHTML = twic.utils.lang.translate('title_about');
			timelineUserId = null;
		} else {
			toolbarTimeline.innerHTML = document.querySelector('#timeline .toolbar p').innerHTML;
			toolbarTimeline.href += '#' + prev.join('#');
			// fixme shitcode
			timelineUserId = parseInt(prev[0], 10);
		}

		if (
			!data.length
			|| 1 !== data.length
		) {
			// todo return to the accounts list screen
			return;
		}

		userName = data[0];

		// update info if it is not loaded yet
		var pageUserName = page.getAttribute('username');
		if (pageUserName !== userName) {
			clearProfileData();

			page.setAttribute('username', userName);

			twic.requests.send('getProfileInfo', {
				'name': userName
			}, showProfile);
			// todo or show an error
		}
	} );

}() );
