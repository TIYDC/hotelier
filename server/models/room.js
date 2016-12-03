'use strict';

module.exports = function(Room) {
    Room.observe('before save', function addAuthor(ctx, next) {
        if (ctx.isNewInstance) {
            // don't allow assignment of ID
            ctx.instance.id = null;
        }
        next();
    });

    Room.validatesUniquenessOf('number');
    Room.validate('maxOccupancy', validateOccupancyRange, {
        message: 'Occupancy must be between 1 and 8'
    });
    Room.validate('rate', validateRate, {
        message: 'Rate must be above 0'
    });

    function validateOccupancyRange(err) {
        if (this.maxOccupancy < 1 || this.maxOccupancy > 8) {
            err();
        }
    }

    function validateRate(err) {
        if (this.rate < 1) {
            err();
        }
    }
};
