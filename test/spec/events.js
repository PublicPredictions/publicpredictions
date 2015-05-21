
describe("Events:", function() {
  var publicpredictions1 = null;
  var publicpredictions2 = null;

  beforeEach(function() {
    var flag = false;

    runs(function() {
      makeAndLoginAs(USER, function(ff1) {
        publicpredictions1 = ff1;
        makeAndLoginAs(USER2, function(ff2) {
          publicpredictions2 = ff2;
          flag = true;
        });
      });
    });

    waitsFor(function() {
      return flag;
    }, "Initializing PublicPredictions with two logins", TIMEOUT * 2);
  });

  it("Suggested User", function() {
    // Check if USER is a suggested user for USER2.
    var flag = false;

    runs(function() {
      publicpredictions2.onNewSuggestedUser(function(user) {
        expect(user).toBe(USER);
        flag = true;
      });
    });

    waitsFor(function() {
      return flag;
    }, "Waiting for suggested user callback", TIMEOUT);
  });

  it("New prediction", function() {
    // Post a prediction on USER2 and see if it appears for USER.
    var flag = false;
    var predictionId = null;
    var content = "this is another sample prediction";

    runs(function() {
      publicpredictions2.post(content, function(err, done) {
        expect(err).toBe(false);
        expect(typeof done).toBe("string");
        predictionId = done;
        publicpredictions1.onNewPrediction(function(id, prediction) {
          if (id != predictionId) {
            return;
          }
          expect(prediction.author).toBe(USER2);
          expect(prediction.by).toBe(USER2);
          expect(prediction.content).toBe(content);
          flag = true;
        });
      });
    });

    waitsFor(function() {
      return flag;
    }, "Waiting for new prediction to appear", TIMEOUT);
  });
});
