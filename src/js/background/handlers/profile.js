/**
 * Profile page support
 *
 * Kalashnikov Igor <igor.kalashnikov@gmail.com>
 * Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported
 */

twic.requests.subscribe('follow', function(data, sendResponse) {
    twic.twitter.follow(data['id'], data['whom_id'], function() {
        sendResponse( { } );
    } );
} );

twic.requests.subscribe('unfollow', function(data, sendResponse) {
    twic.twitter.unfollow(data['id'], data['whom_id'], function() {
        sendResponse( { } );
    } );
} );

twic.requests.subscribe('getUserInfo', function(data, sendResponse) {
    sendResponse(twic.accounts.getInfo(data['id']).user.fields);
} );

twic.requests.subscribe('getProfileInfo', function(data, sendResponse) {
    twic.twitter.getUserInfo( data['name'], function(user) {
        sendResponse( user.fields );
    }, function() {
        sendResponse();
    } );
} );

twic.requests.subscribe('getProfileFriendshipInfo', function(data, sendResponse) {
    twic.twitter.getFriendshipInfo( data['source_id'], data['target_id'], function(friend) {
        sendResponse( friend.getFollowing( data['source_id'], data['target_id'] ) );
    } );
} );
