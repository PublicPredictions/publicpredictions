PublicPredictions
========
PublicPredictions is a web app that lets users post small messages called *sparks* to
their feed. You can follow other users, and their sparks will appear on your
feed.

### [Live Demo](http://publicpredictions.github.io/)

The unique property of this application is that it is built entirely using
client side logic - no server neccessary - other than to serve the static
HTML/CSS/JS files, of course.

This is made possible by [Firebase](http://firebase.com/). A detailed explanation
of how the app was built is [available here](http://publicpredictions.io/about.html).

Developing on Nitrous.IO
------------------------

Start hacking on PublicPredictions on
[Nitrous.IO](https://www.nitrous.io/?utm_source=github.com&utm_campaign=publicpredictions&utm_medium=hackonnitrous)
in seconds:

[![Hack firebase/publicpredictions on Nitrous.IO](https://d3o0mnbgv6k92a.cloudfront.net/assets/hack-l-v1-3cc067e71372f6045e1949af9d96095b.png)](https://www.nitrous.io/hack_button?source=embed&runtime=rails&repo=firebase%2Fpublicpredictions&file_to_open=README.nitrous.md)

Navigating the Code
-------------------
The core application logic is in www/js/publicpredictions.js. It is hooked up to the
UI in www/index.html via www/js/publicpredictions-ui.js.
[publicpredictions.js](http://github.com/firebase/publicpredictions/blob/master/www/js/publicpredictions.js) consists of 11
public methods, all of which are documented with jsdoc.

If you'd like to embed a feed like PublicPredictions into your app, we recommend
importing publicpredictions.js and hooking it up to your own UI. Take a look at
publicpredictions-ui for an example of how this is done!

### iOS Client

An iOS client is also available. Download the app from the
[App Store](https://itunes.apple.com/us/app/ipublicpredictions/id645597646?mt=8&uo=4)
and browse the [source](https://github.com/firebase/iPublicPredictions).

TODO:
-----
0. Set a date on a prediction (default to December 31st of current year).
1. Unfollow a user.
2. Make a user's predictions private.
3. Search for #hashtags.
4. Agree/Disagree with a prediction.
5. Mark prediction Accurate/Inaccurate.

Help
----

Please feel free to [reach out to us](https://groups.google.com/group/firebase-talk)
if you have questions, comments or suggestions!

License
-------
[MIT](http://firebase.mit-license.org).
