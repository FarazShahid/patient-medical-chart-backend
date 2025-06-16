const mongoose = require('mongoose');
const FileData = require('../models/FileData'); // Adjust the path to your FileData model
require("dotenv").config();

// Simple utilities for random data
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate() {
  const year = getRandomInt(1950, 2005);
  const month = getRandomInt(1, 12).toString().padStart(2, '0');
  const day = getRandomInt(1, 28).toString().padStart(2, '0');
  return `${month}/${day}/${year}`;
}

const firstNames = ['JOHN', 'JANE', 'MIKE', 'EMILY', 'ROBERT', 'LISA', 'DAVID', 'SARAH'];
const lastNames = ['SMITH', 'JOHNSON', 'WILLIAMS', 'BROWN', 'JONES', 'GARCIA', 'MARTINEZ'];

function getRandomName() {
  const first = firstNames[getRandomInt(0, firstNames.length - 1)];
  const last = lastNames[getRandomInt(0, lastNames.length - 1)];
  return `${last}, ${first}`;
}

function getRandomGender() {
  return Math.random() < 0.5 ? 'M' : 'F';
}

const cities = ['PHOENIX', 'ALBUQUERQUE', 'PINEHILL', 'FLAGSTAFF'];
const states = ['AZ', 'NM', 'CO', 'UT'];

function getRandomCityStateZip() {
  const city = cities[getRandomInt(0, cities.length - 1)];
  const state = states[getRandomInt(0, states.length - 1)];
  const zip = getRandomInt(10000, 99999);
  return `${city}, ${state} ${zip}`;
}

function getRandomAddress() {
  return `PO BOX ${getRandomInt(1, 9999)}`;
}

// Main function
async function seedData() {
       await mongoose.connect(process.env.MONGO_URI);
  const filename = "ADEKY-RONE_10-02-1986_45280.pdf";
  const path = "pdfs_2/ADEKY-RONE_10-02-1986_45280.pdf";

  for (let i = 1; i <= 1000; i++) {
    const data = {
      filename,
      path,
      recordId: (45280 + i).toString(),
      name: getRandomName(),
      dob: getRandomDate(),
      gender: getRandomGender(),
      address: getRandomAddress(),
      cityStateZip: getRandomCityStateZip(),
    };

    try {
      await FileData.create(data);
      console.log(`✅ Saved record ${data.recordId}`);
    } catch (err) {
      console.error(`❌ Failed to save record ${data.recordId}:`, err);
    }
  }

  console.log('🎉 Done seeding!');
  mongoose.connection.close();
}

seedData();
