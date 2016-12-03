'use strict';

var loopbackContext = require('loopback-context');

module.exports = function(Reservation) {
    Reservation.observe('before save', function addAuthor(ctx, next) {
        if (ctx.isNewInstance) {
            var token = loopbackContext.getCurrentContext().get('accessToken');
            ctx.instance.staffId = ((token) ? token.userId : null);
            ctx.instance.createDate = Date.now();
        }
        next();
    });

    Reservation.validate('checkinDate', validateCheckin, {
        message: 'The check in date cannot be in the past'
    });

    Reservation.validate('checkoutDate', validateCheckout, {
        message: 'The check out date must be after the check in date'
    });

    Reservation.validateAsync('numberOfGuests', validateOccupancy, {
        message: {
            invalid: 'That is not a valid room in this hotel',
            range: 'Reservations must be for 1 to 8 people',
            room: 'That room does not allow for that many people'
        }
    });

    Reservation.validateAsync('guestId', checkGuest, {
        message: 'That is not a valid guest in this hotel'
    });

    Reservation.validateAsync('roomId', checkRoom, {
        message: {
            invalid: 'That is not a valid room in this hotel',
            booked: 'This room is already booked for that date'
        }
    });

    function validateCheckin(errCb) {
        var today = new Date();
        today.setHours(0);
        today.setMinutes(0);
        if (this.checkinDate.getTime() < today.getTime()) {
            errCb();
        }
    }

    function validateCheckout(errCb) {
        if (!this.checkinDate || this.checkinDate > this.checkoutDate) {
            errCb();
        }
    }

    function validateOccupancy(errCb, done) {
        console.log('checking occupancy');

        var resData = this;

        if (resData.numberOfGuests < 1 || resData.numberOfGuests > 8) {
            errCb('range');
            return done();
        }
        Reservation.app.models.Room.findById(resData.roomId, function(err, room) {
            if (err || !room) {
                errCb('invalid');
            } else if (room.maxOccupancy < resData.numberOfGuests) {
                errCb('room');
            }
            done();
        });
    }

    function checkGuest(errCb, done) {
        console.log('checking guest');
        Reservation.app.models.Guest.count({ id: this.guestId }, function(err, count) {
            if (err || !count) {
                errCb();
            }
            done();
        });
    }

    function checkRoom(errCb, done) {
        console.log('checking room');
        var resData = this;
        Reservation.app.models.Room.count({ id: resData.roomId }, function(err, count) {
            if (err || !count) {
                errCb('invalid');
                return done();
            }


            console.log('checking for conflicts');
            Reservation.count({
                and: [
                    {
                        roomId: resData.roomId
                    },
                    {
                        or: [
                            {
                                and: [
                                    { checkinDate: { lte: resData.checkinDate } },
                                    { checkoutDate: { gte: resData.checkinDate } }
                                ]
                            },
                            {
                                and: [
                                    { checkinDate: { lte: resData.checkoutDate } },
                                    { checkoutDate: { gte: resData.checkoutDate } }
                                ]
                            }
                        ]
                    }
                ]
            }, function(err, conflicts) {
                console.log('conflicts checked:', err, conflicts);
                if (err || conflicts) { errCb('booked'); }
                done(); // always need to execute this...
            });

        });
    }
};
