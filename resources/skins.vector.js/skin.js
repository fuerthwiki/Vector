var collapsibleTabs = require( '../skins.vector.legacy.js/collapsibleTabs.js' ),
	vector = require( '../skins.vector.legacy.js/vector.js' ),
	stickyHeader = require( './stickyHeader.js' ),
	languageButton = require( './languageButton.js' ),
	initSearchLoader = require( './searchLoader.js' ).initSearchLoader,
	dropdownMenus = require( './dropdownMenus.js' ),
	searchToggle = require( './searchToggle.js' ),
	sidebar = require( './sidebar.js' );

/**
 * Wait for first paint before calling this function. That's its whole purpose.
 *
 * Some CSS animations and transitions are "disabled" by default as a workaround to this old Chrome
 * bug, https://bugs.chromium.org/p/chromium/issues/detail?id=332189, which otherwise causes them to
 * render in their terminal state on page load. By adding the `vector-animations-ready` class to the
 * `html` root element **after** first paint, the animation selectors suddenly match causing the
 * animations to become "enabled" when they will work properly. A similar pattern is used in Minerva
 * (see T234570#5779890, T246419).
 *
 * Example usage in Less:
 *
 * ```less
 * .foo {
 *     color: #f00;
 *     .transform( translateX( -100% ) );
 * }
 *
 * // This transition will be disabled initially for JavaScript users. It will never be enabled for
 * // no-JS users.
 * .vector-animations-ready .foo {
 *     .transition( transform 100ms ease-out; );
 * }
 * ```
 *
 * @param {Document} document
 * @return {void}
 */
function enableCssAnimations( document ) {
	document.documentElement.classList.add( 'vector-animations-ready' );
}

/**
 * @param {Window} window
 * @return {void}
 */
function main( window ) {
	enableCssAnimations( window.document );
	collapsibleTabs.init();
	sidebar.init( window );
	dropdownMenus();
	vector.init();
	initSearchLoader( document );
	// Initialize the search toggle for the main header only. The sticky header
	// toggle is initialized after wvui search loads.
	searchToggle( document.querySelector( '.mw-header .search-toggle' ) );
	languageButton();
	stickyHeader();
}

/**
 * @param {Window} window
 * @return {void}
 */
function init( window ) {
	var now = mw.now();
	// This is the earliest time we can run JS for users (and bucket anonymous
	// users for A/B tests).
	// Where the browser supports it, for a 10% sample of users
	// we record a value to give us a sense of the expected delay in running A/B tests or
	// disabling JS features. This will inform us on various things including what to expect
	// with regards to delay while running A/B tests to anonymous users.
	// When EventLogging is not available this will reject.
	// This code can be removed by the end of the Desktop improvements project.
	// https://www.mediawiki.org/wiki/Desktop_improvements
	mw.loader.using( 'ext.eventLogging' ).then( function () {
		if (
			mw.eventLog &&
			mw.eventLog.eventInSample( 100 /* 1 in 100 */ ) &&
			window.performance &&
			window.performance.timing &&
			window.performance.timing.navigationStart
		) {
			mw.track( 'timing.Vector.ready', now - window.performance.timing.navigationStart ); // milliseconds
		}
	} );
}

init( window );

if ( document.readyState === 'interactive' || document.readyState === 'complete' ) {
	main( window );
} else {
	// This is needed when document.readyState === 'loading'.
	document.addEventListener( 'DOMContentLoaded', function () {
		main( window );
	} );
}
