// View Model
// ==================================
function viewModel() {

  const model = this; // assign 'this' to a variable for inner scope usage

  this.pins = []; // array of markers
  this.filterList = ko.observable(""); // KO observables for filtering list

  this.mapWrapper = document.getElementById('map'); // get map container
  // map options here fore easier customization
  this.mapOptions = {
    center: new google.maps.LatLng(10.318237, 123.905138),
    zoom: 15,
    styles: mapStyles
  };

  this.fsID = 'MEDLG3UM4RPFOX2RSPR1HNHBBSPBXWLOBJLDYHC5ZO4L2Z23'; // Foursquare Client ID
  this.fsSecret = '1WI13SRQ3JSSVIZ30MXPO4Y5EZATDKTJTW1151KYKWI040JL'; // Foursquare Client Secret

  // Function to display Info Window
  // connect to Foursquare API then populate the infoWindow content
  // @params: marker, infoWindow
  this.showInfoWindow = function(marker, infoWindow) {

    if (infoWindow.marker != marker) {
      infoWindow.setContent('');
      infoWindow.marker = marker;

      // Foursquare url
      const fsApiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
        marker.lat + ',' + marker.lng + '&client_id=' + model.fsID +
        '&client_secret=' + model.fsSecret + '&query=' + marker.title +
        '&v=20170708' + '&m=foursquare';

      // AJAX - Get Foursquare data
      $.getJSON(fsApiUrl)
      .done(function (data) { // if success, set infoWindow contents
        const response = data.response.venues[0];
        model.street = response.location.formattedAddress[0];
        model.city = response.location.formattedAddress[1];
        model.country = response.location.formattedAddress[2];
        model.category = response.categories[0].name;

        model.fsContent = `<h5>(${model.category})</h5>
                	<div><h6>Address: </h6>
                	<p>${model.street}</p>
                	<p>${model.city}</p>
                	<p>${model.country}</p></div></div>`;

        infoWindow.setContent(model.iwContent + model.fsContent);
      })
      .fail(function () { // display error msg if failed to connect to Foursquare API
        Materialize.toast('Failed to connect to Foursquare API! Try refreshing your browser.', 60000, 'red darken-1 z-depth-2');
      });

      this.iwContent = `<div><h4>${marker.title}</h4>`; // get marker title for initial infoWindow content

      infoWindow.open(map, marker); // show infoWindow

      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
      });
    }
  };

  // Function to focus on the selected marker/location
  // and animate the pin
  this.focusMarker = function() {
    model.showInfoWindow(this, model.mainInfoWindow);
    this.setAnimation(google.maps.Animation.BOUNCE); // notice me senpai..
    // stop animation after a set time
    setTimeout((function() {
      this.setAnimation(null);
    }).bind(this), 1400);
  };

  // Function to initialize Map
  this.initMap = function() {

    // set map constructor
    const map = new google.maps.Map(model.mapWrapper, model.mapOptions);

    // initial infoWindow
    this.mainInfoWindow = new google.maps.InfoWindow();

    // loop through the locations array
    // and display markers in map
    for (const value of locations) {
      this.markerTitle = value.title;
      this.markerLat = value.lat;
      this.markerLng = value.lng;
      // setup markers
      this.marker = new google.maps.Marker({
        map: map,
        position: {
          lat: this.markerLat,
          lng: this.markerLng
        },
        title: this.markerTitle,
        lat: this.markerLat,
        lng: this.markerLng,
        animation: google.maps.Animation.DROP
      });
      this.marker.setMap(map);
      this.pins.push(this.marker); // add locations list to array
      this.marker.addListener('click', model.focusMarker);
    }

  };

  this.initMap(); // run initMap function

  // Function to add locations array to sidebar
  // and add filtering feature
  this.locationsFilter = ko.computed(function() {
    let result = [];

    // loop through lcoations list
    for (const value of this.pins) {
      const markerLocation = value;
      if (markerLocation.title.toLowerCase().includes(this.filterList()
          .toLowerCase())) {
        result.push(markerLocation);
        value.setVisible(true);
      } else {
        value.setVisible(false);
      }
    }

    return result;
  }, this);

}