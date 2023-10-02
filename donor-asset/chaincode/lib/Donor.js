/**
 * @author Rajat Rajoria
 * @email rajatrajoria.ju@gmail.com
 * @desc [The base donor class - This contains the basic information that is to be taken and reflected in the patient info section. All the other types of users, will be able to see all or some of the information available here]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */

const crypto = require('crypto');

class Donor 
{
    constructor(donorId, firstName, lastName, password, dob, phoneNumber, address, bloodGroup, changedBy = '', donationHistory={}, creditCard)
    {
        this.donorId = donorId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = crypto.createHash('sha256').update(password).digest('hex');
        this.dob = dob;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.bloodGroup = bloodGroup;
        this.changedBy = changedBy;
        this.pwdTemp = true;
        this.donationHistory = donationHistory;
        this.creditCard = creditCard;
        return this;
    }
}
module.exports = Donor
