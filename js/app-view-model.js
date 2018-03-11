function AppViewModel() {
  var self = this;

  this.searchOption = ko.observable("");
  this.markers = [];

  // This function populates the infowindow when the marker is clicked. We'll only allow
  // one infowindow which will open at the marker that is clicked, and populate based
  // on that markers position.
  this.populateInfoWindow = function(marker, infowindow) {
    if (infowindow.marker != marker) {
      infowindow.setContent('');
      infowindow.marker = marker;
      // Foursquare API Client
      var clientID = "MEDLG3UM4RPFOX2RSPR1HNHBBSPBXWLOBJLDYHC5ZO4L2Z23";
      var clientSecret =
        "1WI13SRQ3JSSVIZ30MXPO4Y5EZATDKTJTW1151KYKWI040JL";
      // URL for Foursquare API
      var apiUrl = 'https://api.foursquare.com/v2/venues/search?ll=' +
        marker.lat + ',' + marker.lng + '&client_id=' + clientID +
        '&client_secret=' + clientSecret + '&query=' + marker.title +
        '&v=20170708' + '&m=foursquare';
      // Foursquare API
      $.getJSON(apiUrl).done(function(marker) {
        var response = marker.response.venues[0];
        self.street = response.location.formattedAddress[0];
        self.city = response.location.formattedAddress[1];
        self.country = response.location.formattedAddress[2];
        self.category = response.categories[0].name;

        self.htmlContentFoursquare = `<h5>(${self.category})</h5>
                	<div><h6>Address: </h6>
                	<p>${self.street}</p>
                	<p>${self.city}</p>
                	<p>${self.country}</p></div></div>`;

        infowindow.setContent(self.htmlContent + self.htmlContentFoursquare);
      }).fail(function() {
        Materialize.toast('Failed to connect to Foursquare API! Try refreshing your browser.', 60000, 'red darken-1 z-depth-2');
      });

      this.htmlContent = `<div><h4>${marker.title}</h4>`;

      infowindow.open(map, marker);

      infowindow.addListener('closeclick', function() {
        infowindow.marker = null;
      });
    }
  };

  this.populateAndBounceMarker = function() {
    self.populateInfoWindow(this, self.largeInfoWindow);
    this.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout((function() {
      this.setAnimation(null);
    }).bind(this), 1400);
  };

  this.initMap = function() {
    var mapCanvas = document.getElementById('map');
    var mapOptions = {
      center: new google.maps.LatLng(10.328620, 123.905306),
      zoom: 15,
      styles: styles
    };
    // Constructor creates a new map - only center and zoom are required.
    var map = new google.maps.Map(mapCanvas, mapOptions);

    // Set InfoWindow
    this.largeInfoWindow = new google.maps.InfoWindow();
    for (var i = 0; i < myLocations.length; i++) {
      this.markerTitle = myLocations[i].title;
      this.markerLat = myLocations[i].lat;
      this.markerLng = myLocations[i].lng;
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
        id: i,
        animation: google.maps.Animation.DROP
      });
      this.marker.setMap(map);
      this.markers.push(this.marker);
      this.marker.addListener('click', self.populateAndBounceMarker);
    }
  };

  this.initMap();

  // This block appends our locations to a list using data-bind
  // It also serves to make the filter work
  this.myLocationsFilter = ko.computed(function() {
    var result = [];
    for (var i = 0; i < this.markers.length; i++) {
      var markerLocation = this.markers[i];
      if (markerLocation.title.toLowerCase().includes(this.searchOption()
          .toLowerCase())) {
        result.push(markerLocation);
        this.markers[i].setVisible(true);
      } else {
        this.markers[i].setVisible(false);
      }
    }
    return result;
  }, this);
}

googleError = function googleError() {
  Materialize.toast('Google Map have failed to load! Try refreshing your browser.', 60000, 'red darken-1 z-depth-2');
};

function startApp() {
    ko.applyBindings(new AppViewModel());
}