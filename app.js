/*global WebSocket*/
/*global EventSource*/
(function() {
  return {
    client_id: 'd3460d081d3f4ecaba722b26634cd546f11ea2af51e8cb00d9f8a3674551f5fc',
    client_secret: 'ec8e6ec87b41634fead10918573447e1090ce07ff0336caf22fd5e8e01924b70',
    fdRoot: 'https://api.flowdock.com',
    // defaultState: 'home',
    events: {
      'app.created':            'start',

      'click .ping_home':       'start',
      'click .logout':          'logout',

      'click .launch_flowdock': 'loadFlowdock',

      'click .login-flowdock':  'loginFlowdock',
      'loadFlowdock.done':      'loadedFlowdock',
      'click button.ping_flowdock':  'postFlowdock',
      // 'postFlowdock.done':      'postedFlowdock',
      'click button.reply_flowdock':'replyFlowdock',
      'keydown .reply_flowdock': function(e) {
        if(e.which == 13) { // if Enter pressed
          this.replyFlowdock(e);
        }
      },

      'app.willDestroy': 'close',

      'loadHall.done':          'hallLoaded',
      'postToHall.done':        'hallPosted',

      'loadSlack.done':         'slackLoaded',
      'postToSlack.done':       'slackPosted',

      'loadHipChat.done':       'hipChatLoaded',
      'postToHipChat.done':     'hipChatPosted'
    },
    requests: {
      // ### Flowdock
      loginFlowdock: function(creds) {
        return {
          url: this.fdRoot + '/oauth/token',
          type: 'POST',
          data: JSON.stringify({
            "client_id": this.client_id,
            "client_secret": this.client_secret,
            "grant_type": "password",
            "scope": "flow private",
            "username": creds.username,
            "password": creds.password
          }),
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
      replyFlowdock: function(option, thread, message) {
        // get the thread or message ID
        var data = JSON.stringify({
          "event": "comment",
          "content": message
        });
        var fd = this.store('flowdock');
        var path = helpers.fmt('/flows/%@/%@/messages/%@/comments', option.organization.name, option.parameterized_name, thread);
        return {
          url: this.fdRoot + path,
          headers: {"Authorization": "Bearer " + fd.access_token},
          type: 'POST',
          data: data,
          dataType: 'JSON',
          contentType: 'application/JSON',
          success: function(r) {
            this.repliedFlowdock(r, path, option);
          }
        };
      },
      getUserFlowdock: function(id) {
        // get the thread or message ID
        var fd = this.store('flowdock');
        var path = helpers.fmt('/users/%@', id);
        return {
          url: this.fdRoot + path,
          headers: {"Authorization": "Bearer " + fd.access_token},
        };
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
    start: function(e) {
      if(e) {e.preventDefault();}
      // temporary until there is a button for it
      var flowdock;
      // if(this.setting('flowdock') === true) {
      //   flowdock = true
      // } else {
      //   flowdock
      // }
      this.switchTo('home', {
        flowdock: this.setting('flowdock')
      });

    },

    // Flowdock functions
    loadFlowdock:   function(e) {
      var fd = this.store('flowdock');
      if(fd) { // TODO make this check the date for validity instead of pure presence? maybe add ELSE IF to refresh token?
        this.ajax('loadFlowdock', fd);
      } else {
        this.switchTo('login', {service: 'flowdock'});
        this.$('button.logout').html('Login');
      }
      this.flowdockUsers = [];
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
      this.$('button.logout').html('Logout');
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
      console.dir(r);
      this.url = helpers.fmt('%@/messages/%@', option.web_url, r.id);
      services.notify(helpers.fmt('Pinged <a href="%@" target="blank">%@ in %@</a>', this.url, option.name, this.service));

      this.messages = [];
      this.listenFlowdock(r.flow, r.id, option);
      this.switchTo('reply', {
        service: 'flowdock',
        url: this.url,
        message: r
      });
    },
    listenFlowdock: function(flow, messageId, option) {
      this.flow = flow;
      this.thread = messageId;
      this.option = option;
      var fd = this.store('flowdock');
      this.stream = new EventSource( helpers.fmt('https://stream.flowdock.com/flows?filter=%@&access_token=%@', flow, fd.access_token) );
      this.stream.onmessage = function(event) {
        var message = JSON.parse(event.data);
        console.dir(message);
        var influxTags = _.find(message.tags, function(tag) {
          return tag.match('influx:' + messageId) !== null;
        });
        if(influxTags) {
          console.log("response to your message!");
          console.log(message.content.text);
          this.receivedResponseFlowdock(message);
        }
        // handle message

      }.bind(this);
    },
    receivedResponseFlowdock: function(message) {
      if(!this.flowdockUsers[ message.user ]) {
        this.ajax('getUserFlowdock', message.user).done(function(r) {
          this.flowdockUsers[r.id] = r;
          message.userObj = r;
          this.renderResponseFlowdock(message);
        });
      } else {
        message.userObj = this.flowdockUsers[ message.user ];
        this.renderResponseFlowdock(message);
      }
    },
    renderResponseFlowdock: function(message) {
      this.messages.push(message);
      var html = this.renderTemplate('_responses', {
        messages: this.messages
      });
      this.$('div.replies_flowdock').html(html);
    },
    replyFlowdock: function(e) {
      e.preventDefault();
      var message = this.$('textarea.reply').val();
      this.ajax('replyFlowdock', this.option, this.thread, message);
    },
    repliedFlowdock: function(r) {
      this.$('textarea.reply').val('');
      console.dir(r);
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

    // close
    close: function() {
      if(this.stream) {
        this.stream.close();
      }
      
    },

    // logout
    logout: function(e) {
      if(e) {e.preventDefault();}

      this.store('flowdock', '');
      this.$('button.logout').html('Login');
      this.loadFlowdock();
    },

    // Helper functions

  };

}());
