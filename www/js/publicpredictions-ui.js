
var __ff_ui;
$(function() {
  __ff_ui = new PublicPredictionsUI();
});

function PublicPredictionsUI() {
  this._limit = 141;
  this._loggedIn = false;
  this._spinner = new Spinner();
  this._publicpredictions = new PublicPredictions("https://publicpredictions.firebaseio.com/");
  this._unload = null;

  // Setup page navigation.
  this._setupHandlers();

  // Setup History listener.
  var self = this;
  window.History.Adapter.bind(window, "statechange", function() {
    self._pageController(window.History.getState().hash, false);
  });

  self._publicpredictions.onStateChange(function(user) {
    self.onLoginStateChange(user);
  });
}

PublicPredictionsUI.prototype._setupHandlers = function() {
  var self = this;
  $(document).on("click", "a.profile-link", function(e) {
    e.preventDefault();
    self._go($(this).attr("href"));
  });
  $(document).on("click", "a.prediction-link", function(e) {
    e.preventDefault();
    self._go($(this).attr("href"));
  });
  $(document).on("click", "#search-button", function(e) {
    e.preventDefault();
    self._go("/?search");
  });
  $(document).on("click", "#top-logo", function(e) {
    e.preventDefault();
    self._go("/");
  });
  $(document).on("click", "#logout-button", function(e) {
    e.preventDefault();
    self.logout();
  });
};

PublicPredictionsUI.prototype._go = function(url) {
  window.History.pushState(null, null, url);
};

PublicPredictionsUI.prototype._pageController = function(url) {
  // Extract sub page from URL, if any.
  var idx = url.indexOf("?");
  var hash = (idx > 0) ? url.slice(idx + 1) : "";
  var value = hash.split("=");

  this._unload && this._unload();

  switch (value[0]) {
    case "profile":
      if (!value[1]) {
        this._unload = this.render404();
      } else {
        this._unload = this.renderProfile(value[1]);
      }
      break;
    case "prediction":
      if (!value[1]) {
        this._unload = this.render404();
      } else {
        this._unload = this.renderPrediction(value[1]);
      }
      break;
    case "search":
      this._unload = this.renderSearch();
      break;
    default:
      if (this._loggedIn) {
        this._unload = this.renderTimeline(this._loggedIn);
      } else {
        this._unload = this.renderHome();
      }
      break;
  }
};

PublicPredictionsUI.prototype._postHandler = function(e) {
  var predictionText = $("#prediction-input");
  var predictionButton = $("#prediction-button");
  var containerEl = $("#prediction-button-div");
  var message = $("<div>").addClass("msg").html("Posting...");

  var self = this;
  e.preventDefault();
  predictionButton.replaceWith(message);
  self._spinner.spin(containerEl.get(0));
  self._publicpredictions.post(predictionText.val(), function(err, done) {
    if (!err) {
      message.html("Posted!").css("background", "#008000");
      predictionText.val("");
    } else {
      message.html("Posting failed!").css("background", "#FF6347");
    }
    self._spinner.stop();
    $("#c-count").val(self._limit);
    message.css("visibility", "visible");
    message.fadeOut(1500, function() {
      message.replaceWith(predictionButton);
      predictionButton.click(self._postHandler.bind(self));
    });
  });
};

PublicPredictionsUI.prototype._handleNewPrediction = function(listId, limit, func) {
  var self = this;
  func(
    limit,
    function(predictionId, prediction) {
      prediction.content = prediction.content.substring(0, self._limit);
      prediction.predictionId = predictionId;
      prediction.friendlyTimestamp = self._formatDate(
        new Date(prediction.timestamp || 0)
      );
      var predictionEl = $(Mustache.to_html($("#tmpl-prediction").html(), prediction)).hide();
      $("#" + listId).prepend(predictionEl);
      predictionEl.slideDown("slow");
    }, function(predictionId) {
      setTimeout(function() {
        $("#prediction-" + predictionId).stop().slideToggle("slow", function() {
          $(this).remove();
        });
      }, 100);
    }
  );
};

PublicPredictionsUI.prototype._formatDate = function(date) {
  var localeDate = date.toLocaleString();
  // Remove GMT offset if it's there.
  var gmtIndex = localeDate.indexOf(' GMT');
  if (gmtIndex > 0) {
    localeDate = localeDate.substr(0, gmtIndex);
  }
  return localeDate;
};

PublicPredictionsUI.prototype._editableHandler = function(id, value) {
  if (id == "inputLocation") {
    this._publicpredictions.setProfileField("location", value);
  }
  if (id == "inputBio") {
    this._publicpredictions.setProfileField("bio", value);
  }
  return true;
};

PublicPredictionsUI.prototype.onLoginStateChange = function(info) {
  this._spinner.stop();
  this._loggedIn = info;
  $("#header").html(Mustache.to_html($("#tmpl-page-header").html(), {user: this._loggedIn}));
  if (info) {
    this.renderTimeline(info);
  } else {
    this.renderHome();
  }
};

PublicPredictionsUI.prototype.logout = function(e) {
  if (e) {
    e.preventDefault();
  }
  this._publicpredictions.logout();
  this._loggedIn = false;
  this.renderHome();
};

PublicPredictionsUI.prototype.render404 = function() {
  // TODO: Add 404 page.
  this.renderHome();
};

PublicPredictionsUI.prototype.goHome = function() {
  this._go("/");
};

PublicPredictionsUI.prototype.renderHome = function(e) {
  if (e) {
    e.preventDefault();
  }
  if (this._loggedIn) {
    return this.renderTimeline(this._loggedIn);
  }

  $("#header").html($("#tmpl-index-header").html());

  // Preload animation.
  var path = "img/curl-animate.gif";
  var img = new Image();
  img.src = path;

  // Setup curl on hover.
  $(".ribbon-curl").find("img").hover(function() {
    $(this).attr("src", path);
  }, function() {
    $(this).attr("src", "img/curl-static.gif");
  });

  var body = Mustache.to_html($("#tmpl-content").html(), {
    classes: "cf home", content: $("#tmpl-index-content").html()
  });
  $("#body").html(body);

  var self = this;
  var loginButton = $("#login-button");
  loginButton.click(function(e) {
    e.preventDefault();
    loginButton.css("visibility", "hidden");
    self._spinner.spin($("#login-div").get(0));
    self._publicpredictions.login('facebook');
  });

  $("#about-link").remove();

  // Attach handler to display the latest 5 predictions.
  self._handleNewPrediction(
    "prediction-index-list", 5,
    self._publicpredictions.onLatestPrediction.bind(self._publicpredictions)
  );
  return function() { self._publicpredictions.unload(); };
};

PublicPredictionsUI.prototype.renderSearch = function() {
  var self = this;
  $("#header").html(Mustache.to_html($("#tmpl-page-header").html(), {user: self._loggedIn}));
  // Render body.
  var content = Mustache.to_html($("#tmpl-search-content").html());
  var body = Mustache.to_html($("#tmpl-content").html(), {
    classes: "cf", content: content
  });
  $("#body").html(body);

  var searchInput = $("#search-input");
  var MAX_SEARCH_TERM_LENGTH = 20;
  self._publicpredictions.startSearch(function(results) {
    var searchResultHtml = Mustache.to_html($('#tmpl-search-result').html(), {results: results});
    $('#search-result-list').html(searchResultHtml);
  });
  var onCharChange = function() {
    var searchTerm = searchInput.val();
    if (searchTerm.length > MAX_SEARCH_TERM_LENGTH) {
      searchTerm = searchTerm.substr(0, MAX_SEARCH_TERM_LENGTH)
      searchInput.val(searchTerm);
    }
    self._publicpredictions.updateSearchTerm(searchTerm);
  };

  searchInput.keyup(onCharChange);
  searchInput.blur(onCharChange);

  return function() { self._publicpredictions.unload(); };
};

PublicPredictionsUI.prototype.renderTimeline = function(info) {
  var self = this;
  $("#header").html(Mustache.to_html($("#tmpl-page-header").html(), {user: self._loggedIn}));

  // Render placeholders for location / bio if not filled in.
  info.location = info.location.substr(0, 80) || "Your Location...";
  info.bio = info.bio.substr(0, 141) || "Your Bio...";

  // Render body.
  var content = Mustache.to_html($("#tmpl-timeline-content").html(), info);
  var body = Mustache.to_html($("#tmpl-content").html(), {
    classes: "cf", content: content
  });
  $("#body").html(body);

  // Attach textarea handlers.
  var charCount = $("#c-count");
  var predictionText = $("#prediction-input");
  $("#prediction-button").css("visibility", "hidden");
  function _textAreaHandler() {
    var text = predictionText.val();
    charCount.text("" + (self._limit - text.length));
    if (text.length > self._limit) {
      charCount.css("color", "#FF6347");
      $("#prediction-button").css("visibility", "hidden");
    } else if (text.length == 0) {
      $("#prediction-button").css("visibility", "hidden");
    } else {
      charCount.css("color", "#999");
      $("#prediction-button").css("visibility", "visible");
    }
  }
  charCount.text(self._limit);
  predictionText.keyup(_textAreaHandler);
  predictionText.blur(_textAreaHandler);

  // Attach post prediction button.
  $("#prediction-button").click(self._postHandler.bind(self));

  // Attach new prediction event handler, capped to 10 for now.
  self._handleNewPrediction(
    "prediction-timeline-list", 10,
    self._publicpredictions.onNewPrediction.bind(self._publicpredictions)
  );

  // Get some "suggested" users.
  self._publicpredictions.getSuggestedUsers(function(userid, info) {
    info.id = userid;
    $(Mustache.to_html($("#tmpl-suggested-user").html(), info)).
      appendTo("#suggested-users");

    //var button = $("#followBtn-" + userid);
    var button = $('.btn-follow');
    // Fade out the suggested user if they were followed successfully.
    button.click(function(e) {
      var $button = $(e.target);
      var id = $button.data('id');
      e.preventDefault();
      $button.remove();
      self._publicpredictions.follow(id, function(err, done) {
        // TODO FIXME: Check for errors!
        $("#followBox-" + userid).fadeOut(1500);
      });
    });
  });

  // Make profile fields editable.
  $(".editable").editable(function(value, settings) {
    self._editableHandler($(this).attr("id"), value);
    return value;
  });
  return function() { self._publicpredictions.unload(); };
};

PublicPredictionsUI.prototype.renderProfile = function(uid) {
  var self = this;
  var facebookId = uid.replace('facebook:', '');
  $("#header").html(Mustache.to_html($("#tmpl-page-header").html(), {user: self._loggedIn}));

  // Render profile page body.
  $("#body").html(Mustache.to_html($("#tmpl-profile-body").html()));

  var followersLoaded = false;
  var followers = [];
  var renderFollowers = function() {
    $('#follower-profile-list').html(Mustache.to_html($('#tmpl-user-list').html(), {users: followers}));
  };

  var followeesLoaded = false;
  var followees = [];
  var renderFollowees = function() {
    $('#followee-profile-list').html(Mustache.to_html($('#tmpl-user-list').html(), {users: followees}));
  };

  // Update user info.
  self._publicpredictions.getUserInfo(uid, function(info) {
    info.id = uid;
    var content = Mustache.to_html($("#tmpl-profile-content").html(), info);
    $("#profile-content").html(content);
    var button = $('.btn-follow');

    // Show follow button if logged in.
    if (self._loggedIn && self._loggedIn.id != info.id) {
      button.click(function(e) {
        var $clickedButton = $(e.target);
        var clickedButtonId = $clickedButton.data('id');
        e.preventDefault();

        self._publicpredictions.follow(clickedButtonId, function(err, done) {
          // TODO FIXME: Check for errors!
          $clickedButton.fadeOut(1500);
        });
      });
    } else {
      button.hide();
    }
  }, /*onFollower=*/ function(newFollower) {
    followers.push(newFollower);
    if (followersLoaded) {
      renderFollowers();
    }
  }, /*onFollowersComplete=*/ function() {
    followersLoaded = true;
    renderFollowers();
  }, /*onFollowee=*/ function(newFollowee) {
    followees.push(newFollowee);
    if (followeesLoaded) {
      renderFollowees();
    }
  }, /*onFolloweesComplete=*/ function() {
    followeesLoaded = true;
    renderFollowees();
  });

  // Render this user's tweets. Capped to 5 for now.
  self._handleNewPrediction(
    "prediction-profile-list", 5,
    self._publicpredictions.onNewPredictionFor.bind(self._publicpredictions, uid)
  );
  return function() { self._publicpredictions.unload(); };
};

PublicPredictionsUI.prototype.renderPrediction = function(id) {
  var self = this;
  $("#header").html(Mustache.to_html($("#tmpl-page-header").html(), {user: self._loggedIn}));

  // Render prediction page body.
  self._publicpredictions.getPrediction(id, function(prediction) {
    if (prediction !== null && prediction.author) {
      self._publicpredictions.getUserInfo(prediction.author, function(authorInfo) {
        for (var key in authorInfo) {
          prediction[key] = authorInfo[key];
        }
        prediction.content = prediction.content.substring(0, self._limit);
        prediction.friendlyTimestamp = self._formatDate(
          new Date(prediction.timestamp || 0)
        );
        var content = Mustache.to_html($("#tmpl-prediction-content").html(), prediction);
        var body = Mustache.to_html($("#tmpl-content").html(), {
          classes: "cf", content: content
        });
        $("#body").html(body);
      });
    }
  });
  return function() { self._publicpredictions.unload(); };
};
