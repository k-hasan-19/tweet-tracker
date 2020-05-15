'use strict';
const dotenv = require('dotenv').config()
const Twitter = require('twitter-lite')
const AWS = require('aws-sdk')

const client = new Twitter({
    // subdomain: "api",
    consumer_key: dotenv.parsed.TWITTER_CONSUMER_KEY || process.env.TWITTER_CONSUMER_KEY, // from Twitter.
    consumer_secret: dotenv.parsed.TWITTER_CONSUMER_SECRET || process.env.TWITTER_CONSUMER_SECRET, // from Twitter.
    access_token_key: dotenv.parsed.TWITTER_ACCESS_TOKEN_KEY || process.env.TWITTER_ACCESS_TOKEN_KEY, // from your User (oauth_token)
    access_token_secret: dotenv.parsed.TWITTER_ACCESS_TOKEN_SECRET || process.env.TWITTER_ACCESS_TOKEN_SECRET // from your User (oauth_token_secret)
});

exports.lambda_handler = async(event, context) => {
    // context.log('JavaScript HTTP trigger function processed a request.');
    let searchResult
    const hashtag = dotenv.parsed.HASHTAG || process.env.HASHTAG
    const tablename = dotenv.parsed.TABLE_NAME || process.env.TABLE_NAME

    try {
        searchResult = await client.get('search/tweets', {
            q: '#' + hashtag,
            count: 10,
            result_type: 'popular',
            lang: 'en'
        })
    }
    catch (e) {
        console.log(e)
        throw Error('Search Failed')
    }
    const docClient = new AWS.DynamoDB.DocumentClient()
    const params = generateParams(tablename, searchResult.statuses, hashtag)
    const dbevent = await insertData(docClient, params)

    return dbevent
};

function insertData(docClient, params) {
    return new Promise((resolve, reject) => {
        docClient.batchWrite(params, (err, data) => {
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

function generateParams(tablename, statuses, hashtag) {
    let params = {
        RequestItems: {},
        ReturnConsumedCapacity: 'TOTAL'
    }
    params.RequestItems[tablename] = []
    statuses.map((status) => {
        let datetime = new Date().toISOString()
        let record = {
            PutRequest: {
                Item: {
                    PK: hashtag,
                    SK: datetime + '#' + status.id_str,
                    tweet: status.text,
                    retweet_count: status.retweet_count,
                    favorite_count: status.favorite_count,
                    possibly_sensitive: status.possibly_sensitive
                }
            }
        }
        params.RequestItems[tablename].push(record)
    })
    return params
}
