'use strict';
const dotenv = require('dotenv').config()
const AWS = require('aws-sdk')



exports.lambda_handler = async(event, context) => {
    let datastoreSearchResult
    const hashtag = event.queryStringParameters.hashtag
    const tablename = dotenv.parsed && dotenv.parsed.TABLE_NAME || process.env.TABLE_NAME
    const sortby = event.queryStringParameters.sortby || 'RT_COUNT'
    const limit = event.queryStringParameters.limit || 10
    const docClient = new AWS.DynamoDB.DocumentClient()
    const params = generateParams(tablename, hashtag, sortby, limit)
    const data = await getData(docClient, params)

    return _response(data.Items, 200)
};

function getData(docClient, params) {
    console.log(params)
    return new Promise((resolve, reject) => {
        docClient.query(params, (err, data) => {
            if (err) {
                console.log("Unable to write items. Error: ", err)
                reject(err)
            }
            else {
                console.log("Successfully added items. Error: ", JSON.stringify(data, null, 2))
                resolve(data)
            }
        })
    })
}

function generateParams(tablename, hashtag, sortby, limit) {
    let indexname;
    if (sortby === 'RT_COUNT') {
        indexname = 'retweet_count-index'
    }
    else {
        indexname = 'favorite_count-index'
    }
    let params = {
        TableName: tablename,
        IndexName: indexname,
        KeyConditionExpression: 'PK = :hashtag',
        ExpressionAttributeValues: {
            ':hashtag': hashtag
        },
        ScanIndexForward: false,
        Limit: parseInt(limit)||100,
        ReturnConsumedCapacity: 'TOTAL'
    }
    return params
}

function _response(data, statusCode) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
}
