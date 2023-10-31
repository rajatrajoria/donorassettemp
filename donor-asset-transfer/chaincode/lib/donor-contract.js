/**
 * @desc [Donor Smartcontract to read and update donor details in legder]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const crypto = require('crypto');
const { Context } = require('fabric-contract-api');

class DonorContract{

    //Read donor's details based on donorId
    async readDonor(ctx, donorID) {
        const exists = await this.donorExists(ctx, donorID);
        if (!exists) {
            throw new Error(`The donor ${donorID} does not exist`);
        }
    
        const buffer = await ctx.stub.getState(donorID);
        let asset = JSON.parse(buffer.toString());
        asset = ({
            donorId: patientId,
            firstName: asset.firstName,
            lastName: asset.lastName,
            dob: asset.dob,
            phoneNumber: asset.phoneNumber,
            address: asset.address,
            bloodGroup: asset.bloodGroup,
            password: asset.password,
            pwdTemp: asset.pwdTemp,
            donationStatus: asset.donationStatus, 
            donationHistory: asset.donationHistory, 
            creditCard: asset.creditCard
        });
        return asset;
    }
    
    //Check if a donor exists against a donor id
    async donorExists(ctx, donorID) {
        const buffer = await ctx.stub.getState(donorID);
        return (!!buffer && buffer.length > 0);
    }

    //This function is to update donor's limited details. This function should be called by donor.
    async updateDonorPersonalDetails(ctx, args) {
        args = JSON.parse(args);
        let isDataChanged = false;
        let donorId = args.donorId;
        let newPhoneNumber = args.phoneNumber;
        let newAddress = args.address;
        
        const donor = await this.readDonor(ctx, donorId)

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
        await ctx.stub.putState(donorId, buffer);
    }

    //This function is to update donor's password. This function should be called by donor.
    async updateDonorPassword(ctx, args) {
        args = JSON.parse(args);
        let donorId = args.donorId;
        let newPassword = args.newPassword;

        if (newPassword === null || newPassword === '') {
            throw new Error(`Empty or null values should not be passed for newPassword parameter`);
        }

        const donor = await this.readDonor(ctx, donorId);
        donor.password = crypto.createHash('sha256').update(newPassword).digest('hex');
        if(donor.pwdTemp){
            donor.pwdTemp = false;
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

    async getDonorHistory(ctx, donorId){
        let asset = this.readDonor(ctx, donorId);
        return asset.donationHistory;
    }

    //Retrieves donor's donation history based on donorId
    // async getDonorHistory(ctx, donorId) {
    //     let resultsIterator = await ctx.stub.getHistoryForKey(donorId);
    //     let asset = await this.getAllDonorResults(resultsIterator);

    //     return this.fetchLimitedFields(asset);
    // }

    // fetchLimitedFields = (asset) => {
    //     for (let i = 0; i < asset.length; i++) {
    //         const obj = asset[i];
    //         asset[i] = {
    //             donationHistory: obj.Record.donationHistory
    //         };
    //     }
    //     return asset;
    // };
}
module.exports = DonorContract;