/**
 * @desc [Primary Smartcontract to initiate ledger with donor details]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { Contract } = require('fabric-contract-api');
let Donor = require('./Donor.js');
let initLedgerDataDonor = require('./initLedgerDonor.json');
let initLedgerDataMaster = require('./initLedgerMaster.json');

class PrimaryContract extends Contract {

    //Initializing the ledgers when the network is up for the first time
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        for (let i = 0; i < initLedgerDataDonor.length; i++) {
                await ctx.stub.putState('D' + initLedgerDataDonor[i]["aadhar"], Buffer.from(JSON.stringify(initLedgerDataDonor[i])));
        }
        console.info('============= END : Initialize Ledger ===========');
    }
    
    async initLedger2(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        for (let i = 0; i < initLedgerDataMaster.length; i++) {
            if(initLedgerDataMaster[i]["type"]=="tempRecord")
                await ctx.stub.putState('T' + initLedgerDataMaster[i]["bloodBagUnitNo"], Buffer.from(JSON.stringify(initLedgerDataMaster[i])));
            else
                await ctx.stub.putState('F' + initLedgerDataMaster[i]["bloodBagUnitNo"], Buffer.from(JSON.stringify(initLedgerDataMaster[i])));
        }
        console.info('============= END : Initialize Ledger ===========');
    }

    //Read donor's complete details based on donorID (example: D13128498)
    async readDonor(ctx, donorID) 
    {	
        const exists = await this.donorExists(ctx, donorID);
        if (!exists) {
            throw new Error(`The donor - ${donorID} does not exist`);
        }
    
        const buffer = await ctx.stub.getState(donorID);
        let asset = JSON.parse(buffer.toString());
        asset = ({
            aadhar: asset.aadhar,
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
    
    //Check if a donor exists against a donorID
    async donorExists(ctx, donorID) {
        const buffer = await ctx.stub.getState(donorID);
        return (!!buffer && buffer.length > 0);
    }

    async getQueryResultForQueryString(ctx, queryString) {
        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        console.info('getQueryResultForQueryString <--> ', resultsIterator);
        let results = await this.getAllDonorResults(resultsIterator);
        return JSON.stringify(results);
    }

    async getAllDonorResults(iterator) {
        let allResults = [];
        while (true) {
            let res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));

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
