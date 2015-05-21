
describe("Operations:", function() {
  var prediction1Id = null;
  var prediction2Id = null;
  var publicpredictions1 = null;
  var publicpredictions2 = null;
  var content1 = "test prediction I"
  var content2 = "test prediction II";

  beforeEach(function() {
    var flag1 = false;

    runs(function() {
      makeAndLoginAs(USER, function(ff1) {
        publicpredictions1 = ff1;
        makeAndLoginAs(USER2, function(ff2) {
          publicpredictions2 = ff2;
          flag1 = true;
        });
      });
    });

    waitsFor(function() {
      return flag1;
    }, "Initializing PublicPredictions with two logins", TIMEOUT * 2);
  });

  it("Post without follower", function() {
    var flag2 = false;

    runs(function() {
      publicpredictions2.post(content1, function(err, done) {
        expect(err).toBe(false);
        expect(typeof done).toBe("string");
        prediction1Id = done;
        flag2 = true;
      });
    });

    waitsFor(function() {
      return flag2;
    }, "Waiting for post to complete", TIMEOUT);
  });

  it("User followed", function() {
    var flag3 = false;

    runs(function() {
      publicpredictions1.follow(USER2, function(err, done) {
        expect(err).toBe(false);
        expect(done).toBe(USER2);
        expect(publicpredictions1._mainUser).toNotBe(null);
        flag3 = true;
      });
    });

    waitsFor(function() {
      return flag3;
    }, "Waiting for follow callback", TIMEOUT);
  });

  it("Previous prediction copied", function() {
    // Check that the previous prediction of the user just followed was copied.
    var flag4 = false;

    runs(function() {
      var stream = publicpredictions1._mainUser.child("stream");
      stream.once("value", function(snap) {
        snap.forEach(function(predictionSnap) {
          if (predictionSnap.name() == prediction1Id) {
            flag4 = true;
          }
        });
      });
    });

    waitsFor(function() {
      return flag4;
    }, "Waiting for prediction copy callback", TIMEOUT);
  });

  it("User in following list", function() {
    // Check that the user just followed is in the following list.
    var flag5 = false;

    runs(function() {
      var ref = publicpredictions1._mainUser.child("following").child(USER2);
      ref.once("value", function(snapshot) {
        expect(snapshot.val() === true);
        flag5 = true;
      });
    });

    waitsFor(function() {
      return flag5;
    }, "Waiting for user to added in following list", TIMEOUT);
  });

  it("User in follower list", function() {
    // Check that USER2 has USER in the follower list.
    var flag6 = false;

    runs(function() {
      var ref = publicpredictions2._firebase.child("users").child(USER2);
      ref.child("followers").once("value", function(snapshot) {
        expect(snapshot.val() === true);
        flag6 = true;
      });
    });

    waitsFor(function() {
      return flag6;
    }, "Waiting for user to be added in follower list", TIMEOUT);
  });

  it("Post in global list", function() {
    var flag7 = false;

    // Check that the prediction appears in the global list.
    runs(function() {
      publicpredictions2._firebase.child("predictions").once("child_added", function(snap) {
        var prediction = snap.val();
        expect(prediction.author).toBe(USER2);
        expect(prediction.content).toBe(content2);
        prediction2Id = snap.name();
        flag7 = true;
      });
      publicpredictions2.post(content2, function(err, done) {
        expect(err).toBe(false);
        expect(typeof done).toBe("string");
      });
    });

    waitsFor(function() {
      return flag7;
    }, "Waiting for prediction to appear in global list", TIMEOUT);
  });

  it("Post in user list", function() {
    // Check that the prediction appears in the user's prediction list.
    var flag8 = false;

    runs(function() {
      var ref = publicpredictions2._firebase.child("predictions").child(prediction2Id);
      ref.once("value", function(snap) {
        var prediction = snap.val();
        expect(snap.name()).toBe(prediction2Id);
        expect(prediction.author).toBe(USER2);
        expect(prediction.content).toBe(content2);
        flag8 = true;
      });
    });

    waitsFor(function() {
      return flag8;
    }, "Waiting for prediction to appear in user list", TIMEOUT);
  });

  it("Post in follower stream", function() { 
    // Check that the prediction appeared in a follower's stream.
    var flag9 = false;

    runs(function() {
      var ref = publicpredictions1._mainUser.child("stream").child(prediction2Id);
      ref.once("value", function(snap) {
        expect(snap.name()).toBe(prediction2Id);
        expect(snap.val()).toBe(true);
        flag9 = true;
      });
    });

    waitsFor(function() {
      return flag9;
    }, "Waiting for prediction to appear in follower stream", TIMEOUT);
  });
});
