'use strict';

var loopbackContext = require('loopback-context');

module.exports = function(Reservation) {
    Reservation.observe('before save', function addAuthor(ctx, next) {
        if (ctx.isNewInstance) {
            var token = loopbackContext.getCurrentContext().get('accessToken');
            ctx.instance.staffId = ((token) ? token.userId : null);
        }
        next();
    });
};
