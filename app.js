(function() {

  return {
    defaultState: 'loading',
    requests: {
      fetchAudits: function() {
        return {
          url: helpers.fmt('/api/v2/tickets/%@/audits.json?include=users',
                           this.ticket().id())
        };
      }
    },
    events: {
      'app.activated'           : 'onAppActivated',
      'fetchAudits.done'        : 'onFetchAuditsDone'
    },

    onAppActivated: function(app) {
      if (app.firstLoad) {
        this.ajax('fetchAudits');
      }
    },

    onFetchAuditsDone: function(data) {
      var comments = _.reduce(data.audits, function(memo, audit) {
        if (audit.via.channel === 'email') {
          var comment = _.first(_.filter(audit.events, function(e){
            return e.type === 'Comment';
          }));

          if (comment) {
            var author = _.first(_.filter(data.users, function(u) {
              return u.id == comment.author_id;
            }));

            comment.audit_id = audit.id;
            comment.author = author;
            comment.created_at = new Date(audit.created_at).toLocaleString();

            memo.push(comment);
          }
        }

        return memo;
      }, []);

      this.switchTo('main', { comments: comments.reverse() });

      this.$('a').tooltip({ placement: 'left', html: true });
    }
  };

}());
