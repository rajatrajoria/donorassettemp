/**
 * @desc [Smartcontract to manage before, during and after blood-collection processes - to be executed at doctor's end]
 */
/*
 * SPDX-License-Identifier: Apache-2.0
 */
'use strict';

const AdminContract = require('./admin-contract.js');
const PrimaryContract = require("./primary-contract.js");
const { Context } = require('fabric-contract-api');

class DoctorContract extends AdminContract{

    //Read donor details based on donorId
    async readDonor(ctx, donorID) {
        let asset = await PrimaryContract.prototype.readDonor(ctx, donorID)
        asset = ({
            aadhar: asset.aadhar,
            firstName: asset.firstName,
            lastName: asset.lastName,
            dob: asset.dob,
            bloodGroup: asset.bloodGroup,
            donationHistory: asset.donationHistory
        });
        return asset;
    }

    //This function is to screen the donor details. This function should be called by only phelbotomist.
    //This will be the screening test. If all the basic criteria are fulfilled, we will go to the blood collection process.
    async screenDonor(ctx, args) {
        args = JSON.parse(args);
        let donorId = args.donorId;
        let donor = await PrimaryContract.prototype.readDonor(ctx, donorId);
        //now evaluating the donor - fetching his parameters
        const age = (new Date() - donor.dob) / (1000*60*60*24*365);
        const numberOfDonationsMade = Object.keys(donor.donationHistory).length;
       	const dateOfLastDonation = donor.donationHistory['donation' + (numberOfDonationsMade)]['dateOfDonation'];
       	const duration = (dateOfLastDonation!=null)?(new Date() - dateOfLastDonation)/(1000*60*60*24) : null;
       	//now checking if the donor passes the screening test
       	if(age<18 || age>60 || (duration!=null && duration<120)) 
		throw new Error(`The donor ${donorId} is not eligible to donate blood`);
	donor.donationHistory['donation' + (numberOfDonationsMade + 1)] = {'dateOfDonationRegistration': new Date(), 'status': 'in progress'};
        const buffer = Buffer.from(JSON.stringify(donor));
        await ctx.stub.putState(donorId, buffer);
    }
    
    //This function is called by the doctor once the blood is collected successfully.
    async collectionUpdateDonor(ctx, args){	//args here will contain: donorId, status(S/F) and blood parameters
    	args = JSON.parse(args);
        let donorId = args.donorId;
        let donor = await PrimaryContract.prototype.readDonor(ctx, donorId);
        let status = args.status;
        const numberOfDonationsMade = Object.keys(donor.donationHistory).length;
        if(status=='failed'){
        	donor.donationHistory['donation' + (numberOfDonationsMade + 1)]['status']  = 'failed';
        }
        else{
        	donor.donationHistory['donation' + (numberOfDonationsMade + 1)]['dateOfDonation'] = new Date();
        	donor.donationHistory['donation' + (numberOfDonationsMade + 1)]['status'] = 'successful';
        	donor.donationHistory['donation' + (numberOfDonationsMade + 1)]['bagUnit'] = args.bagUnitNumber;
        	donor.donationHistory['donation' + (numberOfDonationsMade + 1)]['bagSegment'] = args.bagSegment;	
        }
        const buffer = Buffer.from(JSON.stringify(donor));
        await ctx.stub.putState(donorId, buffer);
    }
}

module.exports = DoctorContract;
