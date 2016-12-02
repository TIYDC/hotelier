'use strict';

module.exports = function(Guest) {
    Guest.validatesUniquenessOf('email');
    Guest.validatesUniquenessOf('phone');
};
