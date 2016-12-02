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

    Reservation.validateAsync('roomId', checkForDoubleBooking, {
        message: 'This room is already booked for that date'
    });

    function checkForDoubleBooking(err, done) {
        var timestamp = (this.checkinDate instanceof Date) ?
            this.checkinDate.getTime() :
            this.checkinDate;
        var resDate = new Date(timestamp);
        if (!resDate.getTime()) {
            return err();
        }

        resDate.setHours(0);
        resDate.setMinutes(0);
        var startTs = resDate.getTime();
        var endTs = startTs + (86400000 * this.numberOfNights);

        Reservation.count({
            roomId: this.roomId,
            and: [
                { checkinDate: { gte: startTs } },
                { checkinDate: { lte: endTs } }
            ]
        }, function(err, conflicts) {
            if (err || conflicts) {
                return err();
            }
        });
    }
};
