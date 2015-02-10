
describe("Initialization:", function() {
  var publicpredictions = null;

  beforeEach(function() {
    publicpredictions = helpers.createFeed();
  });

  afterEach(function() {
    publicpredictions.unload();
    publicpredictions = null;
  });

  it("Constructor", function() {
    expect(typeof publicpredictions).toBe(typeof {});
    expect(publicpredictions._baseURL).toBe(BASEURL);
  });

  it("Login", function() {
    spyOn(publicpredictions._firebase, 'authWithOAuthPopup');
    publicpredictions.login('facebook');
    expect(publicpredictions._firebase.authWithOAuthPopup).toHaveBeenCalled();
  });

  it("Logout", function() {
    spyOn(publicpredictions._firebase, 'unauth');
    publicpredictions.logout();
    expect(publicpredictions._firebase.unauth).toHaveBeenCalled();
  });

});
