'use strict';

module.exports = function(Guest) {
    Guest.observe('before save', function addAuthor(ctx, next) {
        if (ctx.isNewInstance) {
            // don't allow assignment of ID
            ctx.instance.id = null;
        }
        next();
    });

    Guest.validatesUniquenessOf('email');
    Guest.validatesUniquenessOf('phone');
};
