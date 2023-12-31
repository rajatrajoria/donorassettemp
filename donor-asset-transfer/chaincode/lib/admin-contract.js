/**
 * @desc [Admin Smartcontract to create, read donor details in legder]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

let Donor = require('./Donor.js');
const PrimaryContract = require('./primary-contract.js');

class AdminContract extends PrimaryContract 
{

    //Create donor in the ledger
    async createDonor(ctx, args) {
        args = JSON.parse(args);

        if (args.password === null || args.password === '') {
            throw new Error(`Empty or null values should not be passed for password parameter`);
        }
        let newDonor = new Donor(args.aadhar, args.firstName, args.lastName, args.address, args.dob, args.phoneNumber, args.bloodGroup, '-', {}, args.creditCard);
        const donorID = 'D' + newDonor.aadhar;
        const exists = await this.donorExists(ctx, donorID);
        if (exists) {
            throw new Error(`The donor ${newDonor.aadhar} already exists`);
        }
        const buffer = Buffer.from(JSON.stringify(newDonor));
        await ctx.stub.putState(donorID, buffer);
    }

    //Read donor's limited details based on donorID
    async readDonor(ctx, donorID) {
        let asset = await super.readDonor(ctx, donorID)
        asset = ({
            aadhar: asset.aadhar,    //12324
            firstName: asset.firstName,
            lastName: asset.lastName,
            phoneNumber: asset.phoneNumber,
            address: asset.address
        });
        return asset;
    }
    
    async deletePatient(ctx, donorID) {
        const exists = await this.donorExists(ctx, donorId);
        if (!exists) {
            throw new Error(`The donor ${patientId} does not exist`);
        }
        await ctx.stub.deleteState(donorID);
    }

    //Retrieves all donors' name and id
    /*
    async queryAllDonors(ctx) {
        let resultsIterator = await ctx.stub.getStateByRange('', '');
        let asset = await this.getAllDonorResults(resultsIterator);
        return this.fetchNamesAndId(asset);
    }

    fetchLimitedFields = asset => {
        for (let i = 0; i < asset.length; i++) {
            const obj = asset[i];
            asset[i] = {
                donorId: obj.Key,
                firstName: obj.Record.firstName,
                lastName: obj.Record.lastName,
                phoneNumber: obj.Record.phoneNumber,
                address: obj.Record.address
            };
        }
        return asset;
    }

    fetchNamesAndId = asset => {
        for (let i = 0; i < asset.length; i++) {
            const obj = asset[i];
            asset[i] = {
                donorId: obj.Key,
                firstName: obj.Record.firstName,
                lastName: obj.Record.lastName,
            };
        }
        return asset;
    }*/
}
module.exports = AdminContract;
