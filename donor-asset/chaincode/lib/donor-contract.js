/**
 * @author Rajat Rajoria
 * @email rajatrajoria.ju@gmail.com
 * @desc [Donor smartcontract to read, update and delete own details in the ledger]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */


'use strict';

let Donor = require('./Donor.js');
const crypto = require('crypto');
const PrimaryContract = require('./primary-contract.js');
const { Context } = require('fabric-contract-api');

class DonorContract extends PrimaryContract {

    //Read donor details based on donorId
    async readDonor(ctx, donorId) {
        return await super.readDonor(ctx, donorId);
    }

    //Delete donor from the ledger based on donorId
    async deletedonor(ctx, donorId) {
        const exists = await this.donorExists(ctx, donorId);
        if (!exists) {
            throw new Error(`The donor ${donorId} does not exist in the ledger`);
        }
        await ctx.stub.deleteState(donorId);
    }

    //This function is to update donor's personal details. This function should be called by donor only.
    async updateDonorPersonalDetails(ctx, args) {
        args = JSON.parse(args);
        let isDataChanged = false;
        let donorId = args.donorId;
        let newFirstname = args.firstName;
        let newLastName = args.lastName;
        let newDob = args.dob;
        let updatedBy = args.changedBy;
        let newPhoneNumber = args.phoneNumber;
        let newAddress = args.address;
        let newCreditCard = args.creditCard;

        const donor = await this.readDonor(ctx, donorId)
        if (newFirstname !== null && newFirstname !== '' && donor.firstName !== newFirstname) {
            donor.firstName = newFirstname;
            isDataChanged = true;
        }

        if (newLastName !== null && newLastName !== '' && donor.lastName !== newLastName) {
            donor.lastName = newLastName;
            isDataChanged = true;
        }

        if (newDob !== null && newDob !== '' && donor.dob !== newDob) {
            donor.dob = newDob;
            isDataChanged = true;
        }

        if (updatedBy !== null && updatedBy !== '') {
            donor.changedBy = updatedBy;
        }

        if (newPhoneNumber !== null && newPhoneNumber !== '' && donor.phoneNumber !== newPhoneNumber) {
            donor.phoneNumber = newPhoneNumber;
            isDataChanged = true;
        }

        if (newAddress !== null && newAddress !== '' && donor.address !== newAddress) {
            donor.address = newAddress;
            isDataChanged = true;
        }
        
        if (newCreditCard !== null && newCreditCard !== '' && donor.creditCard !== newCreditCard) {
            donor.creditCard = newCreditCard;
            isDataChanged = true;
        }

        if (isDataChanged === false) return;

        const buffer = Buffer.from(JSON.stringify(donor));
        await ctx.stub.putState(donorId, buffer);
    }

    //This function is to update donor password. This function should be called by donor.
    async updatedonorPassword(ctx, args) {
        args = JSON.parse(args);
        let donorId = args.donorId;
        let newPassword = args.newPassword;

        if (newPassword === null || newPassword === '') {
            throw new Error(`Empty or null values should not be passed for newPassword parameter`);
        }

        const donor = await this.readdonor(ctx, donorId);
        donor.password = crypto.createHash('sha256').update(newPassword).digest('hex');
        if(donor.pwdTemp){
            donor.pwdTemp = false;
            donor.changedBy = donorId;
        }
        const buffer = Buffer.from(JSON.stringify(donor));
        await ctx.stub.putState(donorId, buffer);
    }

    //Returns the donor's password
    async getDonorPassword(ctx, donorId) {
        let donor = await this.readDonor(ctx, donorId);
        donor = ({
            password: donor.password,
            pwdTemp: donor.pwdTemp})
        return donor;
    }

    //Retrieves donor's history based on donorId
    async getDonorHistory(ctx, donorId) {
        let resultsIterator = await ctx.stub.getHistoryForKey(donorId);
        let asset = await this.getAllDonorResults(resultsIterator, true);
        return this.fetchLimitedFields(asset, true);
    }

    fetchLimitedFields = (asset, includeTimeStamp = false) => {
        for (let i = 0; i < asset.length; i++) {
            const obj = asset[i];
            asset[i] = {
                donorId: obj.Key,
                firstName: obj.Record.firstName,
                lastName: obj.Record.lastName,
                dob: obj.Record.dob,
                address: obj.Record.address,
                phoneNumber: obj.Record.phoneNumber,
                bloodGroup: obj.Record.bloodGroup,
                creditCard: obj.Record.creditCard,
		        donationHistory: obj.Record.donationHistory
            };
            if (includeTimeStamp) {
                asset[i].changedBy = obj.Record.changedBy;
                asset[i].Timestamp = obj.Timestamp;
            }
        }
        return asset;
    };
}
module.exports = DonorContract;
