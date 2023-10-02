/**
 * @author Rajat Rajoria
 * @email rajatrajoria.ju@gmail.com
 * @desc [Primary smartcontract to initiate ledger with already existing donor details - *This primary contract will be included in every contract chaincode - doctors, admins, donors*]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { Contract } = require('fabric-contract-api');
let Donor = require('./Donor.js');
let initDonors = require('./initLedger.json');

class PrimaryContract extends Contract {
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        for (let i = 0; i < initDonors.length; i++) {
            initDonors[i].docType = 'donor';
            await ctx.stub.putState('ID' + initDonors[i].donorId, Buffer.from(JSON.stringify(initDonors[i])));
            console.info('Added <--> ', initDonors[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    //Read donor details based on DonorId
    async readDonor(ctx, donorId) {
        const exists = await this.DonorExists(ctx, donorId);
        if (!exists) {
            throw new Error(`The donor ${donorId} does not exist in the ledger record`);
        }

        const buffer = await ctx.stub.getState(donorId);
        let asset = JSON.parse(buffer.toString());
        asset = ({
            donorId: donorId,
            firstName: asset.firstName,
            lastName: asset.lastName,
            dob: asset.dob,
            phoneNumber: asset.phoneNumber,
            address: asset.address,
            bloodGroup: asset.bloodGroup,
            password: asset.password,
            pwdTemp: asset.pwdTemp,
            donationHistory: asset.donationHistory,
            creditCard: asset.creditCard
        });
        return asset;
    }

    //Check if a donor exists against a donor id
    async donorExists(ctx, donorId) {
        const buffer = await ctx.stub.getState(donorId);
        return (!!buffer && buffer.length > 0);
    }

    //Query Result for a string
    async getQueryResultForQueryString(ctx, queryString) {
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        console.info('getQueryResultForQueryString <--> ', resultsIterator);
        let results = await this.getAllDonorResults(resultsIterator, false);
        return JSON.stringify(results);
    }

    //Getting all records of a donor
    async getAllDonorResults(iterator, isHistory) {
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

                if (isHistory && isHistory === true) {
                    jsonRes.Timestamp = res.value.timestamp;
                }
                jsonRes.Key = res.value.key;

                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }
                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return allResults;
            }
        }
    }
}
module.exports = PrimaryContract;
