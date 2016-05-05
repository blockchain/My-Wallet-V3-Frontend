/*
 * Redirect users to the new wallet
 * page in a way that busts stale caches
 */
window.location.pathname = 'wallet';
window.location.hash = '';
window.location.queryString = 'bustcache=20160504';
