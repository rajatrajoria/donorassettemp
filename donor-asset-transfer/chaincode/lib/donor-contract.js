/**
 * @desc [Donor Smartcontract to read and update donor details in legder]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

let Donor = require('./donor.js');
const crypto = require('crypto');
const PrimaryContract = require('./primary-contract.js');
const { Context } = require('fabric-contract-api');

class DonorContract extends PrimaryContract{
/*
    //Read donor's details based on donorID
    async readDonor(ctx, donorID) {
        return await super.readDonor(ctx, patientId);
    }

    //This function is to update donor's limited details. This function should be called by donor.
    async updateDonorPersonalDetails(ctx, args) {
        args = JSON.parse(args);
        let isDataChanged = false;
        let donorID = args.donorID;
        let newPhoneNumber = args.phoneNumber;
        let newAddress = args.address;
        
        let donor = await this.readDonor(ctx, donorID)

        if (newPhoneNumber !== null && newPhoneNumber !== '' && donor.phoneNumber !== newPhoneNumber) {
            donor.phoneNumber = newPhoneNumber;
            isDataChanged = true;
        }

        if (newAddress !== null && newAddress !== '' && donor.address !== newAddress) {
            donor.address = newAddress;
            isDataChanged = true;
        }

        if (isDataChanged === false) 
        return;

        const buffer = Buffer.from(JSON.stringify(donor));
        await ctx.stub.putState(donorID, buffer);
    }

    //This function is to update donor's password. This function should be called by donor.
    async updateDonorPassword(ctx, args) {
        args = JSON.parse(args);
        let donorID = args.donorID;
        let newPassword = args.newPassword;

        if (newPassword === null || newPassword === '') {
            throw new Error(`Empty or null values should not be passed for newPassword parameter`);
        }

        let donor = await this.readDonor(ctx, donorID);
        donor.password = crypto.createHash('sha256').update(newPassword).digest('hex');
        if(donor.pwdTemp){
            donor.pwdTemp = false;
        }
        const buffer = Buffer.from(JSON.stringify(donor));
        await ctx.stub.putState(donorID, buffer);
    }

    //Returns the donor's password
    async getDonorPassword(ctx, donorID) {
        let donor = await this.readDonor(ctx, donorID);
        donor = ({
            password: donor.password,
            pwdTemp: donor.pwdTemp
        })
        return donor;
    }

    async getDonorHistory(ctx, donorID){
        let asset = this.readDonor(ctx, donorID);
        return asset.donationHistory;
    }*/
}
module.exports = DonorContract;
