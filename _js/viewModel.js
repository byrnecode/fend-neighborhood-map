// View Model
// ==================================
function viewModel() {

  const model = this;

  this.pins = [];
  this.filterList = ko.observable("");

  this.mapWrapper = document.getElementById('map');
  this.mapOptions = {
    center: new google.maps.LatLng(10.328620, 123.905306),
    zoom: 15
  };

  this.fsID = 'MEDLG3UM4RPFOX2RSPR1HNHBBSPBXWLOBJLDYHC5ZO4L2Z23'; // Foursquare Client ID
  this.fsSecret = '1WI13SRQ3JSSVIZ30MXPO4Y5EZATDKTJTW1151KYKWI040JL'; // Foursquare Client Secret

  // Function to display Info Window
  this.showInfoWindow = function(marker, infoWindow) {
    if (infoWindow.marker != marker) {
      infoWindow.setContent('');
      infoWindow.marker = marker;

      // Foursquare url
      const fsApiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
        marker.lat + ',' + marker.lng + '&client_id=' + model.fsID +
        '&client_secret=' + model.fsSecret + '&query=' + marker.title +
        '&v=20170708' + '&m=foursquare';

      // get Foursquare data
      $.getJSON(fsApiUrl)
      .done(function(marker) {
        const response = marker.response.venues[0];
        model.street = response.location.formattedAddress[0];
        model.city = response.location.formattedAddress[1];
        model.country = response.location.formattedAddress[2];
        model.category = response.categories[0].name;

        model.htmlContentFoursquare = `<h5>(${model.category})</h5>
                	<div><h6>Address: </h6>
                	<p>${model.street}</p>
                	<p>${model.city}</p>
                	<p>${model.country}</p></div></div>`;

        infoWindow.setContent(model.htmlContent + model.htmlContentFoursquare);
      })
      .fail(function() {
        Materialize.toast('Failed to connect to Foursquare API! Try refreshing your browser.', 60000, 'red darken-1 z-depth-2');
      });

      this.htmlContent = `<div><h4>${marker.title}</h4>`;

      infoWindow.open(map, marker);

      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
      });
    }
  };

  this.focusMarker = function() {

    model.showInfoWindow(this, model.mainInfoWindow);
    this.setAnimation(google.maps.Animation.BOUNCE);

    setTimeout((function() {
      this.setAnimation(null);
    }).bind(this), 1400);

  };

  this.initMap = function() {

    // 
    const map = new google.maps.Map(model.mapWrapper, model.mapOptions);

    //
    this.mainInfoWindow = new google.maps.InfoWindow();

    for (const value of locations) {
      this.markerTitle = value.title;
      this.markerLat = value.lat;
      this.markerLng = value.lng;
      // Google Maps marker setup
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
      this.pins.push(this.marker);
      this.marker.addListener('click', model.focusMarker);
    }

  };

  this.initMap();

  // 
  this.locationsFilter = ko.computed(function() {
    let result = [];

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