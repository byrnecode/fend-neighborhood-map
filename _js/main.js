// ============================================================================
// Function to initialize APP
// ============================================================================
function init() {
	ko.applyBindings(new viewModel());
}

// ============================================================================
// Function to display error msg for loading Map
// ============================================================================
function mapError() {
	Materialize.toast('Google Map have failed to load! Try refreshing your browser.', 60000, 'red darken-1 z-depth-2');
}

// ============================================================================
// Document-ready events
// ============================================================================
$(document).ready(function () {

	// Initialize collapse button
  $(".button-collapse").sideNav();

});