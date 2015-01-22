(function() {

  return {
    client_id: 'd3460d081d3f4ecaba722b26634cd546f11ea2af51e8cb00d9f8a3674551f5fc',
    client_secret: 'ec8e6ec87b41634fead10918573447e1090ce07ff0336caf22fd5e8e01924b70',
    fdRoot: 'https://api.flowdock.com',
    events: {
      'app.created':            'start',

      'click .ping_home':       'start',

      'click .login-flowdock':  'loginFlowdock',
      // 'loginFlowdock.done':     'loggedinFlowdock',
      'loadFlowdock.done':      'loadedFlowdock',
      'click button.flowdock':  'postFlowdock',
      // 'postFlowdock.done':      'postedFlowdock',

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
        var data = JSON.stringify({
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
          dataType: 'JSON',
          contentType: 'application/JSON'
        };
      },
      loadFlowdock:     function(fd) {
        return {
          url: this.fdRoot + '/flows',
          headers: {"Authorization": "Bearer " + fd.access_token}
        };
      },
      postFlowdock:   function(option, message, tags) {
        var data = JSON.stringify({
          "event": "message",
          "content": message,
          "tags":  tags
        });
        var fd = this.store('flowdock');
        var organization = option.organization.name, // set this dynamically
            flow = option.parameterized_name, // set this dynamically
            path = helpers.fmt('/flows/%@/%@/messages', organization, flow);
            // NOTE: look into using a Target (or just the app?) to create "Threads" when a ticket is created, then update it by external_thread_id when an agent has a comment
        return {
          url: this.fdRoot + path,
          headers: {"Authorization": "Bearer " + fd.access_token},
          type: 'POST',
          data: data,
          dataType: 'JSON',
          contentType: 'application/JSON',
          success: function(r) {
            this.postedFlowdock(r, path, option);
          }
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

      // temporary until there is a button for it
      if(this.setting('flowdock') === true) {
        this.loadFlowdock();
      }

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
      this.service = "flowdock";
      this.options = r;
      this.switchTo('form', {
        service: this.service,
        options: r
      });
    },
    postFlowdock: function(e) {
      e.preventDefault();
      var option = _.find(this.options, function(option) {
        return this.$('.option').val() == option.id;
      }, this);
      // console.log(this.option);
      var message = this.$('.message').val();
      var tags = this.$('.tags').val().split(/\W/);

      if ( this.$('.include_url').prop('checked') ) {
        var url = helpers.fmt('\nhttps://%@.zendesk.com/agent/tickets/%@', this.currentAccount().subdomain(), this.ticket().id());
        message += url;
      }
      if ( this.$('.include_id').prop('checked') ) {
        var id = this.ticket().id();
        tags.push(id.toString());
      }
      
      this.ajax('postFlowdock', option, message, tags);
    },
    postedFlowdock: function(r, flowPath, option) {
      // debugger;
      console.log(r);
      console.log(option);
      var url = helpers.fmt('%@/messages/%@', option.web_url, r.id);
      services.notify(helpers.fmt('Pinged <a href="%@" target="blank">%@ in %@</a>', url, option.name, this.service));
      
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
