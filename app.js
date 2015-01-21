(function() {

  return {
    events: {
      'app.created':'start',

      'click .login-flowdock':  'loginFlowdock',
      'loginFlowdock.done':     'flowdockLoggedIn',
      'loadFlowdock.done':      'flowdockLoaded',
      'postToFlowdock.done':    'flowdockPosted',

      'loadHall.done':          'hallLoaded',
      'postToHall.done':        'hallPosted',

      'loadSlack.done':         'slackLoaded',
      'postToSlack.done':       'slackPosted',

      'loadHipChat.done':       'hipChatLoaded',
      'postToHipChat.done':     'hipChatPosted'
    },
    requests: {
      // Flowdock
      loginFlowdock:    function() {

      },
      loadFlowdock:     function(url) {
        return {

        };
      },
      postToFlowdock:   function() {
        return {

        };
      },

      // Hall
      loadHall:     function(url) {
        return {

        };
      },
      postToHall:       function() {
        return {

        };
      },

      // Slack
      loadSlack: function(url) {
        return {

        };
      },
      postToSlack:      function() {
        return {

        };
      },

      // Hipchat
      loadHipChat:  function(url) {
        return {

        };
      },
      postToHipchat:    function() {
        return {

        };
      },

    },
    // Framework event functions
    start:          function() {

      if(this.setting('flowdock') === true) {
        this.loadFlowdock();
      }

      // TODO add other conditionals

    },

    // Flowdock functions
    loadFlowdock:   function(e) {
      var info = this.store('flowdock');
      if(info) { // TODO make this check the date for validity instead of pure presence? maybe add ELSE IF to refresh token?
        this.ajax('loadFlowdock', info.access_token);
      } else {
        this.switchTo('login', {service: 'flowdock'});
      }
    },
    loginFlowdock:  function(e) { // on click of login button
      this.ajax('loginFlowdock')
      .done(function(r) {
        // store the token and loadFlowdock
        this.store('flowdock', r);
        this.loadFlowdock();
      })
      .fail(function(r) {
        // handle login failure

      });
      
    },
    flowdockLoaded: function(r) {

    },
    postToFlowdock: function(r) {

    },

    // Hall functions
    loadHall:       function(r) {

    },
    hallLoaded:     function(r) {

    },
    postToHall:     function(r) {

    },

    // Slack functions
    loadSlack:      function(e) {

    },
    slackLoaded:    function(r) {

    },
    postToSlack:    function(r) {

    },

    // HipChat functions
    loadHipChat:    function(e) {

    },
    hipChatLoaded:  function(r) {

    },
    postToHipChat:  function(r) {

    },

    // Helper functions

  };

}());
