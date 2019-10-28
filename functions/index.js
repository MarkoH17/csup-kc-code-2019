const functions = require('firebase-functions');
const axios = require('axios');
const cors = require('cors')({origin: true});
const regression = require('regression');
const googleTrends = require('google-trends-api');
const API_KEY = '<ENTER API KEY HERE>';


function getRadiusByCoors(lat1, lon1, lat2, lon2, unit) {
    //Full Credit: GeoDataSource (https://www.geodatasource.com/developers/javascript)
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        let radlat1 = Math.PI * lat1 / 180;
        let radlat2 = Math.PI * lat2 / 180;
        let theta = lon1 - lon2;
        let radtheta = Math.PI * theta / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit === 'K') {
            dist = dist * 1.609344
        }
        if (unit === 'N') {
            dist = dist * 0.8684
        }
        return dist;
    }
}

function getGeoStr(place_description) {
    let locality_data = place_description.split(', ');
    return locality_data.slice(-1)[0].substring(0, 2) + '-' + locality_data[1]; //e.g. US-CO, US-NY, US-CA
}

function calcScore(ratingScore, interestScore) {
    const ratingWeight = 0.3;
    const interestWeight = 0.7;

    ratingScore = parseFloat(ratingScore);
    interestScore = parseFloat(interestScore);

    return Math.round((((interestWeight * ((interestScore + 1.92) / 3.84)) + (ratingWeight * ((5 - ratingScore) / 5))) * 100) * 100) / 100;
}

async function getGeometryByPlaceId(place_id) {
    let url = 'https://maps.googleapis.com/maps/api/geocode/json?key=' + API_KEY + '&place_id=' + place_id;
    let res = await axios.get(url);
    return res.data.results[0].geometry;
}

async function getPlaceRatingByPlaceId(place_id) {
    let url = 'https://maps.googleapis.com/maps/api/place/details/json?key=' + API_KEY + '&sessiontoken=1234567890&fields=rating&place_id=' + place_id;
    let res = await axios.get(url);
    return res.data.result.rating;
}

async function getRatingData(place_id, term) {
    let geometry = await getGeometryByPlaceId(place_id);
    let radius = getRadiusByCoors(geometry.bounds.northeast.lat, geometry.bounds.northeast.lng, geometry.bounds.southwest.lat, geometry.bounds.southwest.lng, 'K') * 1000;
    radius = Math.round(radius);
    let url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?key=' + API_KEY + '&sessiontoken=1234567890&input=' + encodeURI(term) + '&location=' + geometry.location.lat + ',' + geometry.location.lng + '&radius=' + radius;
    let res = await axios.get(url);
    let places = res.data.predictions;

    return Promise.all(places.map(async (place) => {
        return getPlaceRatingByPlaceId(place.place_id);
    })).then((ratings) => {
        ratings = ratings.filter(Boolean);
        let avgRating = (ratings.reduce((acc, c) => acc + parseFloat(c), 0) / ratings.length).toFixed(2);
        return {
            avgRating: parseFloat(avgRating),
            radius: radius
        };
    });
}

async function getTrendSlopeByKeyword(keyword, place_description) {
    let formatted_locality = getGeoStr(place_description);
    return googleTrends.interestOverTime({
        keyword: keyword,
        startTime: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        endTime: new Date(),
        geo: formatted_locality
    }) //startDate: 1 year ago, endDate: now
        .then(function (results) {
            let res = JSON.parse(results);
            let seriesData = res.default.timelineData.map(function (point, i) {
                return [i, point.value[0]];
            });
            let slope = regression.linear(seriesData).equation[0];
            return {seriesData: seriesData, slope: slope};
        })
        .catch(function (err) {
            return {seriesData: [], slope: 0};
        });
}

async function getTrendRelatedTopics(keyword, place_description) {
    let formatted_locality = getGeoStr(place_description);
    return googleTrends.relatedTopics({
        keyword: keyword,
        startTime: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        endTime: new Date(),
        geo: formatted_locality
    }) //startDate: 1 year ago, endDate: now
        .then(function (results) {
            let res = JSON.parse(results);
            let rankTopics = res.default.rankedList[0].rankedKeyword.map(function (rt) {
                if (rt.topic.type === "Topic") {
                    return rt.topic.title;
                }
            }).filter(Boolean);
            let rankKeywords = res.default.rankedList[1].rankedKeyword.map(function (rk) {
                if (rk.topic.type === "Topic") {
                    return {title: rk.topic.title, formattedValue: rk.formattedValue}
                }
            }).filter(Boolean);
            return {rankedTopics: rankTopics, rankedKeywords: rankKeywords};
        })
        .catch(function (err) {
            return {rankedTopics: [], rankedKeywords: []};
        });
}

async function gatherData(calculatedResults, place_id, place_description, industry_id, industry_description) {
    let ratingData = getRatingData(place_id, industry_description);
    let trendData = getTrendSlopeByKeyword(industry_id, place_description);
    let trendTopics = getTrendRelatedTopics(industry_id, place_description);
    return await Promise.all([ratingData, trendData, trendTopics])
        .then(results => {
            calculatedResults.rating.ratingAvg = results[0].avgRating;
            calculatedResults.rating.ratingRadius = results[0].radius;
            calculatedResults.trend.trendSlope = results[1].slope;
            calculatedResults.trend.trendSeriesData = results[1].seriesData;
            calculatedResults.trend.relatedTopics = results[2].rankedTopics;
            calculatedResults.trend.relatedTrendingTopics = results[2].rankedKeywords;
            calculatedResults.result = calcScore(calculatedResults.rating.ratingAvg, calculatedResults.trend.trendSlope);
            return calculatedResults;
        })
        .catch(error => {
            console.error(error);
        })
}

exports.calc = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        let calculatedResults = {
            rating: {
                ratingAvg: -1,
                ratingRadius: -1, //measured in meters
            },
            trend: {
                trendSlope: -1,
                trendSeriesData: [],
                relatedTopics: [],
                relatedTrendingTopics: []
            },
            result: -1
        };

        if (typeof request.body.place_id == null || typeof request.body.place_description == null || typeof request.body.industry_id == null || typeof request.body.industry_description == null) {
            response.send(calculatedResults);
        } else {
            const place_id = request.body.place_id; //used for region
            const place_description = decodeURI(request.body.place_description); //used for constraining trends regions

            const industry_id = decodeURI(request.body.industry_id); //used for industry
            const industry_description = decodeURI(request.body.industry_description);

            gatherData(calculatedResults, place_id, place_description, industry_id, industry_description).then(results => {
                response.send(calculatedResults);
            });
        }
    });
});

//Autocomplete Location (from Maps Places) Endpoint
exports.acLocation = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        //Used to proxy data between front-end location input and Google Places API autocomplete
        if (typeof request.body.query == null) {
            response.send('{}');
        } else {
            let url = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input=' + encodeURI(request.body.query) + '&key=' + API_KEY + '&types=(regions)&components=country:us';
            axios.get(url).then(results => {
                response.send(results.data);
            });
        }
    });
});

//Autocomplete Industry (from Trend Suggestions) Endpoint
exports.acIndustry = functions.https.onRequest((request, response) => {
    cors(request, response, () => {
        //Used to proxy data between front-end location input and Google Trends API autocomplete
        if (typeof request.body.query == null) {
            response.send('{}');
        } else {
            googleTrends.autoComplete({keyword: request.body.query})
                .then(function (results) {
                    let res = JSON.parse(results);
                    let fTopics = res.default.topics.map(function (t) {
                        if (t.type === "Topic") {
                            return t;
                        }
                    }).filter(Boolean);
                    response.send({topics: fTopics});
                })
                .catch(function (err) {
                    response.send(err);
                })
        }
    });
});

