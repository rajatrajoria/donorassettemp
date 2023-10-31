/**
 * @desc [The base donor class]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */

const crypto = require('crypto');

class Donor {

    constructor(aadhar, firstName, lastName, address, dob, phoneNumber, bloodGroup, donationStatus = '-', donationHistory = {}, creditCard=0, password)
    {
        this.aadhar = aadhar;
        this.firstName = firstName;
        this.lastName = lastName;
        this.address = address;
        this.dob = dob;
        this.phoneNumber = phoneNumber;
        this.bloodGroup = bloodGroup;
        this.donationStatus = donationStatus;
        this.donationHistory=donationHistory;
        this.creditCard=creditCard;
        this.password = crypto.createHash('sha256').update(password).digest('hex');
        this.pwdTemp = true;
        return this;
    }
}
module.exports = Donor
