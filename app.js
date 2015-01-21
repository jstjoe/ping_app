(function() {

  return {
    client_id: 'd3460d081d3f4ecaba722b26634cd546f11ea2af51e8cb00d9f8a3674551f5fc',
    client_secret: 'ec8e6ec87b41634fead10918573447e1090ce07ff0336caf22fd5e8e01924b70',
    fdRoot: 'https://api.flowdock.com',
    events: {
      'app.created':'start',

      'click .login-flowdock':  'loginFlowdock',
      // 'loginFlowdock.done':     'loggedinFlowdock',
      'loadFlowdock.done':      'loadedFlowdock',
      'postFlowdock.done':      'flowdockPosted',

      'loadHall.done':          'hallLoaded',
      'postToHall.done':        'hallPosted',

      'loadSlack.done':         'slackLoaded',
      'postToSlack.done':       'slackPosted',

      'loadHipChat.done':       'hipChatLoaded',
      'postToHipChat.done':     'hipChatPosted'
    },
    requests: {
      // ### Flowdock
      loginFlowdock:    function(creds) {
        console.log(creds);
        var token = btoa(creds.username + ":" + creds.password),
            data = JSON.stringify({
              "client_id": this.client_id,
              "client_secret": this.client_secret,
              "grant_type": "password",
              "scope": "flow private",
              "username": creds.username,
              "password": creds.password
            });
        return {
          url: this.fdRoot + '/oauth/token',
          type: 'POST',
          data: data,
          headers: {"Authorization": "Basic " + token},
          dataType: 'JSON',
          contentType: 'application/JSON'
        };
      },
      loadFlowdock:     function(fd) {
        // var fd = this.store('flowdock');
        return {
          url: this.fdRoot + '/flows',
          headers: {"Authorization": "Bearer " + fd.access_token}
        };
      },
      postFlowdock:   function() {
        var organization = '', // set this dynamically
            flow = '', // set this dynamically
            path = helpers.fmt('/flows/%@/%@/messages', organization, flow);
            // NOTE: look into using a Target (or just the app?) to create "Threads" when a ticket is created, then update it by external_thread_id when an agent has a comment
        return {
          url: this.fdRoot + path,
          headers: {"Authorization": "Bearer " + token},
          dataType: 'JSON',
          contentType: 'application/JSON'
        };
      },
      replyFlowdock: function() {
        // get the thread or message ID
      },

      // ### Hall
      loadHall:     function(url) {
        return {

        };
      },
      postToHall:       function() {
        return {

        };
      },

      // ### Slack
      loadSlack: function(url) {
        return {

        };
      },
      postToSlack:      function() {
        return {

        };
      },

      // ### Hipchat
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
      var fd = this.store('flowdock');
      if(fd) { // TODO make this check the date for validity instead of pure presence? maybe add ELSE IF to refresh token?
        this.ajax('loadFlowdock', fd);
      } else {
        this.switchTo('login', {service: 'flowdock'});
      }
    },
    loginFlowdock:  function(e) { // on click of login button
      e.preventDefault();
      var creds = {
        username: this.$('.username').val(),
        password: this.$('.password').val()
      };
      this.ajax('loginFlowdock', creds)
      .done(function(r) {
        // store the token and loadFlowdock
        this.store('flowdock', r); // contains access_token, refresh_token, expires_in, and token_type
        this.loadFlowdock();
        services.notify("Authenticated to Flowdock. You will stay logged-in on this computer until you click the 'Logout' button or the token is otherwise removed."); // use a translation
      })
      .fail(function(r) {
        // handle login failure
        services.notify('Flowdock login failed.');
      });
    },
    loadedFlowdock: function(r) {
      console.log(r);
    },
    postFlowdock: function(r) {
      console.log(r);
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
