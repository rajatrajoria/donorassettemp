/**
 * @desc [Primary Smartcontract to initiate ledger with donor details]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const { Contract } = require('fabric-contract-api');
let Donor = require('./Donor.js');
let initLedgerData = require('./initLedger.json');

class PrimaryContract extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        for (let i = 0; i < initLedgerData.length; i++) {
            initLedgerData[i].docType = 'info';
            const type = initLedgerData[i]["type"];
            if(type=="donorRecord")
                await ctx.stub.putState('D' + initLedgerData[i]["aadhar"], Buffer.from(JSON.stringify(initLedgerData[i])));
            else if(type=="tempRecord")
                await ctx.stub.putState('T' + initLedgerData[i]["bloodBagUnitNo"], Buffer.from(JSON.stringify(initLedgerData[i])));
            else
                await ctx.stub.putState('F' + initLedgerData[i]["bloodBagUnitNo"], Buffer.from(JSON.stringify(initLedgerData[i])));
            console.info('Added <--> ', initLedgerData[i]);
        }
        console.info('============= END : Initialize Ledger ===========');
    }

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

    // async getQueryResultForQueryString(ctx, queryString) {
    //     let resultsIterator = await ctx.stub.getQueryResult(queryString);
    //     console.info('getQueryResultForQueryString <--> ', resultsIterator);
    //     let results = await this.getAllDonorResults(resultsIterator);
    //     return JSON.stringify(results);
    // }

    // async getAllDonorResults(iterator) {
    //     let allResults = [];
    //     while (true) {
    //         let res = await iterator.next();

    //         if (res.value && res.value.value.toString()) {
    //             let jsonRes = {};
    //             console.log(res.value.value.toString('utf8'));

    //             jsonRes.Key = res.value.key;

    //             try {
    //                 jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
    //             } catch (err) {
    //                 console.log(err);
    //                 jsonRes.Record = res.value.value.toString('utf8');
    //             }
    //             allResults.push(jsonRes);
    //         }
    //         if (res.done) {
    //             console.log('end of data');
    //             await iterator.close();
    //             console.info(allResults);
    //             return allResults;
    //         }
    //     }
    //}
}
module.exports = PrimaryContract;
