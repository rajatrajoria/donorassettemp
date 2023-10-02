/**
 * @author Rajat Rajoria
 * @email rajatrajoria.ju@gmail.com
 * @desc [Admin Smartcontract to create, and read donor details in legder]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

let Donor = require('./Donor.js');
const PrimaryContract = require('./primary-contract.js');

class AdminContract extends PrimaryContract {

    //Create donor in the ledger
    async createDonor(ctx, args) {
        args = JSON.parse(args);

        if (args.password === null || args.password === '') {
            throw new Error(`Empty or null values should not be passed for password parameter`);
        }

        let newDonor = await new Donor(args.donorId, args.firstName, args.lastName, args.password, args.dob, args.phoneNumber, args.address, args.bloodGroup, args.changedBy, args.creditCard);
        const exists = await this.DonorExists(ctx, newDonor.donorId);
        if (exists) {
            throw new Error(`The donor ${newDonor.donorId} already exists in the ledger record`);
        }
        const buffer = Buffer.from(JSON.stringify(newDonor));
        await ctx.stub.putState(newDonor.donorId, buffer);
    }

    //Read donor details based on donorId - will be able to read only basic information(not all) - Data Privacy
    async readDonor(ctx, donorId) {
        let asset = await super.readDonor(ctx, donorId)
        asset = ({
            donorId: donorId,
            firstName: asset.firstName,
            lastName: asset.lastName,
            dob: asset.dob,
            bloodGroup: asset.bloodGroup,
            phoneNumber: asset.phoneNumber,
        });
        return asset;
    }

    //Delete donor from the ledger based on donorId
    async deleteDonor(ctx, donorId) {
        const exists = await this.donorExists(ctx, donorId);
        if (!exists) {
            throw new Error(`The donor ${donorId} does not exist`);
        }
        await ctx.stub.deleteState(donorId);
    }

    //Retrieves all donor details
    async queryAllDonors(ctx) {
        let resultsIterator = await ctx.stub.getStateByRange('', '');
        let asset = await this.getAllDonorResults(resultsIterator, false);
        return this.fetchLimitedFields(asset);
    }

    fetchLimitedFields = asset => {
        for (let i = 0; i < asset.length; i++) {
            const obj = asset[i];
            asset[i] = {
                donorId: obj.Key,
                firstName: obj.Record.firstName,
                lastName: obj.Record.lastName,
                dob: obj.Record.dob,
                bloodGoup: Record.bloodGroup,
                phoneNumber: obj.Record.phoneNumber,
            };
        }

        return asset;
    }
}
module.exports = AdminContract;
