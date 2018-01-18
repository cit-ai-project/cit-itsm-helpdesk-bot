/*
  Project : ITSM-Helpdesk-BOT
  Copyright: Congruent Info Tech
  Written By: Ramanathan, Oct 2017
  Purpose: This is server side request processor cum back-end (sails) wrapper
*/




var restify = require('restify');
var builder = require('botbuilder');
var apiairecognizer = require('api-ai-recognizer');
var HashMap = require('hashmap');
var map = new HashMap();
var mysql = require('mysql');
var request = require('request'); //var request = require('request');
//var moduleA = require( "./admin.js" );
// import your routes

var assetId;
var userId = 'R2527';
var backEndSystemIPPort = "192.168.60.222:1337"; // Sails Backend System

// Setup Restify Server
var server = restify.createServer();

var connection = mysql.createConnection({
    host: '192.168.61.162', //localhost - 192.168.61.162
    port: '3306',
    user: 'root',
    password: 'root',   //
    database: 'helpdesk'
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: '3920ca45-4176-43f6-aaf6-be7b4804f750',
    appPassword: 'xonaTNP3)+dzcBQAD6844#='
});


//server.post('/webhook', connector.listen());
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);

var recognizer = new apiairecognizer('9f3aa1a87cb84cf1a3c2159110a52643'); //63b8f1eb608f4e0ab4e8be8e436aac9e

var intents = new builder.IntentDialog({
    recognizers: [recognizer],
    intentThreshold: 0.2,
    recognizeOrder: builder.RecognizeOrder.series

});

server.listen(process.env.port || process.env.PORT || 7070, function () {
    console.log('%s listening to %s', server.name, server.url);
});


bot.dialog('/', intents);

intents.matches('Default Welcome Intent', function (session, args) {

    session.sendTyping();
    session.userData = {};
    session.privateConversationData = {};
    session.conversationData = {};
    session.dialogData = {};
    console.log('session.message.user.id', session.message.user.id);
    console.log('session.message.address.user.name', session.message.address.user.name);

    var fulfillment =
        builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');

    if (fulfillment && fulfillment.entity != '') {
        var speech = fulfillment.entity;
        session.send(speech);
    } else {
        session.send('Sorry...Could you say that again ?');
    }

    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);
});


intents.matches('Default Fallback Intent', function (session, args) {

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        var fulfillment =
            builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
        if (fulfillment && fulfillment.entity != '') {
            var speech = fulfillment.entity;
            session.send(speech);
        } else {
            session.send('Sorry...Could you say that again ?');
        }
    } else {
        setTimeout(function () {
            session.send('Please ask anything relevant to IT helpdesk.');
        }, 3000);
    }

    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);

});

intents.matches('Generic Problem With PC', function (session, args) {

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {

        // This is for Non-supported issues
        if (session.message.text.toLowerCase().indexOf("printer") >= 0 || session.message.text.toLowerCase().indexOf("scanner") >= 0 || session.message.text.toLowerCase().indexOf("tablet") >= 0 || session.message.text.toLowerCase().indexOf("phone") >= 0
            || session.message.text.toLowerCase().indexOf("mobile") >= 0 || session.message.text.toLowerCase().indexOf("fax") >= 0 || session.message.text.toLowerCase().indexOf("iPad") >= 0 || session.message.text.toLowerCase().indexOf("iPhone") >= 0) {

            session.send('Sorry, i can help you on Computer related issues only...!');

        } else {
            var fulfillment =
                builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
            if (fulfillment && fulfillment.entity != '') {
                var speech = fulfillment.entity;
                session.send(speech);
            }
        }
    } else {
        session.send('Please begin your conversation, saying " Hi / Hello " ');
    }

    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);
});


// Can you please specify if it's a PC (desktop, laptop etc.)?

intents.matches('Specific Problem With PC', function (session, args) {
    console.log(' -----> map.get(prev_intent): ', map.get('prev_intent'));
    console.log(' -----> map.get(prev_input): ', map.get('prev_input'));

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        var userInput = session.message.text.toLowerCase();
        // This is for Non-supported issues
        if (session.message.text.toLowerCase().indexOf("printer") >= 0 || session.message.text.toLowerCase().indexOf("scanner") >= 0 || session.message.text.toLowerCase().indexOf("tablet") >= 0 || session.message.text.toLowerCase().indexOf("phone") >= 0
            || session.message.text.toLowerCase().indexOf("mobile") >= 0 || session.message.text.toLowerCase().indexOf("fax") >= 0 || session.message.text.toLowerCase().indexOf("iPad") >= 0 || session.message.text.toLowerCase().indexOf("iPhone") >= 0) {
            session.send('Sorry, i can help you on Computer related issues only...!');
        } else {

            var pcGenericFulfillment =
                builder.EntityRecognizer.findEntity(args.entities, 'Asset_PC_Generic');

            if (pcGenericFulfillment && pcGenericFulfillment.entity != '') {
                console.log(' -----> pcGenericFulfillment.entity: ', pcGenericFulfillment.entity);
                entity = pcGenericFulfillment.entity;

                //If there is a space between a search string
                if (entity.indexOf(' ') >= 0) {
                    entitySubStr1 = entity.split(' ')[0];
                    entitySubStr2 = entity.split(' ')[1];
                }

                if ((userInput.indexOf(entity) >= 0)
                    || (userInput.indexOf(entitySubStr1) >= 0 && userInput.indexOf(entitySubStr2) >= 0)) {

                    session.send('Can you please specify the type (desktop, laptop, etc.) if it\'s a PC ?');
                }
            }

            var pcSpecificFulfillment =
                builder.EntityRecognizer.findEntity(args.entities, 'Asset_PC_Specific');

            var entity;
            var entitySubStr1, entitySubStr2;

            if (pcSpecificFulfillment && pcSpecificFulfillment.entity != '') {
                console.log(' -----> pcSpecificFulfillment.entity: ', pcSpecificFulfillment.entity);
                entity = pcSpecificFulfillment.entity;
                //If there is a space between a search string
                if (entity.indexOf(' ') >= 0) {
                    entitySubStr1 = entity.split(' ')[0];
                    entitySubStr2 = entity.split(' ')[1];
                }

                if ((userInput.indexOf(entity) >= 0)
                    || (userInput.indexOf(entitySubStr1) >= 0 && userInput.indexOf(entitySubStr2) >= 0)) {

                    session.send('Got it. Can you please specify your asset name/id to create a trouble ticket?');

                }
            }

            if (pcGenericFulfillment == null && pcSpecificFulfillment == null) {

                session.send('Can you please specify the type (desktop, laptop, etc.) if it\'s a PC ?');
            }

        }
    } else {
        session.send('Please begin your conversation, saying " Hi / Hello " ');
    }

    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);
    map.set('ticket_title', session.message.text);
    map.set('ticket_desc', session.message.text);

});


intents.matches('Yes Computer Issue', function (session, args) {

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        var userInput = session.message.text.toLowerCase();
        var pcSpecificFulfillment =
            builder.EntityRecognizer.findEntity(args.entities, 'Asset_PC_Specific');
        console.log('pcSpecificFulfillment: ', pcSpecificFulfillment);

        if (pcSpecificFulfillment && pcSpecificFulfillment.entity != '') {
            if (userInput.indexOf(pcSpecificFulfillment.entity) >= 0) {
                session.send('Got it. Can you please specify your asset name/id to create a trouble ticket?');
            } else {
                session.send('Please specify the type (desktop, laptop, etc.) if it\'s a PC ?');
            }
        }



    } else {
        session.send('Please begin your conversation, saying " Hi / Hello " ');
    }

    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);
});

intents.matches('Irrelevant Questions', function (session, args) {

    session.sendTyping();

    session.send('Please ask relevant to IT helpdesk. ');
    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);
});


intents.matches('No Computer Issue', function (session, args) {

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        session.send('Sorry, i can help you on Computer related issues only..');
    } else {
        session.send('Please begin your conversation, saying " Hi / Hello " ');
    }
    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);
});



intents.matches('Do Not Know Computer Id', function (session, args) {

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        var fulfillment =
            builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');

        if (fulfillment && fulfillment.entity != '') {
            var speech = fulfillment.entity;
            session.send(speech);
        } else {
            session.send('Sorry...Could you say that again ?');
        }

    } else {
        session.send('Please begin your conversation, saying " Hi / Hello " ');
    }
    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);
});



intents.matches('Get N Validate Asset Id', function (session, args) {
    console.log('\n\n');
    console.log(' ---> args: ', args);
    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        var mysql = require('mysql');

        var userInput = session.message.text.toLowerCase();

        var assetFulfillment =
            builder.EntityRecognizer.findEntity(args.entities, 'Asset');
        console.log('assetFulfillment: ', assetFulfillment);

        if (assetFulfillment && assetFulfillment.entity != '') {
            if (userInput.indexOf(assetFulfillment.entity) >= 0) {
                assetId = assetFulfillment.entity;
            } else {
                assetId = '';
            }
        }
        console.log('1 assetId: ', assetId);
        if (assetId == '' || typeof assetId === 'undefined') {

            if (userInput.indexOf('ram-lp') >= 0) {
                assetId = 'ram-lp';
            } else if (userInput.indexOf('mani-lp') >= 0) {
                assetId = 'mani-lp';
            } else if (userInput.indexOf('clem-dk') >= 0) {
                assetId = 'clem-dk';
            } else if (userInput.indexOf('vijo-dk') >= 0) {
                assetId = 'vijo-dk';
            } else if (userInput.indexOf('shan-lp') >= 0) {
                assetId = 'shan-lp';
            }
        }

        console.log('2 assetId: ', assetId);
        console.log('userId: ', userId);

        session.send(' Let me check the Asset ID….'); //ram-lp
        // Server - 192.168.60.222
        // Local - 192.168.61.153
        var url = "http://" + backEndSystemIPPort + "/api/helpdesk/asset/validateAsset?assetId=" + assetId + "&userId=" + userId;
        console.log('--First--> url: ', url);
        request(url, function (error, response, body) {
            console.log('------> error: ', error);

            if (!error && response.statusCode == 200) {

                var jsonObj = JSON.parse(body);

                console.log('----> jsonObj: ', jsonObj);

                if (jsonObj.results) {
                    console.log('----> jsonObj.results - asset_id: ', jsonObj.results[0].asset_id);
                    console.log('----> jsonObj.results - asset_name: ', jsonObj.results[0].asset_name);

                    if (jsonObj.results[0].asset_id && jsonObj.results[0].asset_name) {

                        setTimeout(function () {
                            session.send(
                                'OK, I am able to figure out the Asset ID in our asset list.');
                        }, 6000);
                        session.sendTyping();
                        //Call API for Ticket Generation
                        url = "http://" + backEndSystemIPPort + "/api/helpdesk/userTicket/create?ticket_title=" + map.get('ticket_title') + "&ticket_desc=" + map.get('ticket_desc') + "&priority=1&severity=1&status=1&asset=ram-lp&created_by=S8888";
                        console.log('--Second--> url: ', url);

                        request(url, function (error, response, body) {
                            console.log('--error: ', error);

                            if (!error && response.statusCode == 200) {

                                jsonObj = JSON.parse(body);

                                console.log('--2--> jsonObj: ', jsonObj);

                                if (jsonObj) {

                                    setTimeout(function () {
                                        session.send(
                                            "Thank you, I have created a ticket for you. The ticket id is " + jsonObj.TicketNo + ". Someone from IT department will attend your problem within 24 hours.");
                                    }, 9000);

                                } else {
                                    setTimeout(function () {
                                        session.send(
                                            'Unable to create a ticket for you. Please try after some time. Sorry for the inconvenience.');
                                    }, 9000);
                                }

                            } else {

                                setTimeout(function () {
                                    session.send(
                                        'Unable to create a ticket for you. Please try after some time. Sorry for the inconvenience.');
                                }, 9000);

                            }

                        });

                    }

                } else {
                    setTimeout(function () {
                        session.send('The given Asset ID is not in the Asset List. Can you please check again?.');
                    }, 6000);
                }
            } else {
                setTimeout(function () {
                    session.send('The given Asset ID is not in the Asset List. Can you please check again?.');
                }, 6000);
            }
        });

    } else {
        session.send('Please begin your conversation, saying " Hi / Hello " ');
    }
    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);
});


intents.matches('My PC', function (session, args) {

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        if (typeof map.get('prev_intent') !== 'undefined' && map.get('prev_intent') &&
            map.get('prev_intent') == 'Specific Problem With PC') {

            session.send(
                'Please specify the type (desktop, laptop, etc.) if it\'s a PC ?');

        } else {
            session.send('Let me explore....');

            var url = "http://" + backEndSystemIPPort + "/api/helpdesk/asset/getAssetByUser?&userId=" + userId;
            console.log('----> url: ', url);
            request(url, function (error, response, body) {
                console.log('------> error: ', error);

                if (!error && response.statusCode == 200) {

                    var jsonObj = JSON.parse(body);

                    console.log('----> jsonObj: ', jsonObj);

                    if (jsonObj.results) {
                        console.log('----> jsonObj.results - asset_id: ', jsonObj.results[0].asset_id);
                        console.log('----> jsonObj.results - asset_name: ', jsonObj.results[0].asset_name);
                        var retrievedAssetFromDB = jsonObj.results[0].asset_name;

                        if (jsonObj.results[0].asset_id && jsonObj.results[0].asset_name) {

                            setTimeout(function () {
                                session.send(
                                    'OK, I am able to figure out the Asset ID in our asset list.');
                            }, 6000);

                            session.sendTyping();

                            setTimeout(function () {
                                console.log('----> retrievedAssetFromDB: ', retrievedAssetFromDB);
                                session.send(
                                    "Your Asset id is " + retrievedAssetFromDB + ".");
                            }, 9000);

                            //Call API for Ticket Generation
                            url = "http://" + backEndSystemIPPort + "/api/helpdesk/userTicket/create?ticket_title=" + map.get('ticket_title') + "&ticket_desc=" + map.get('ticket_desc') + "&priority=1&severity=1&status=1&asset=ram-lp&created_by=S8888";
                            console.log('--Second--> url: ', url);

                            request(url, function (error, response, body) {
                                console.log('--error: ', error);

                                if (!error && response.statusCode == 200) {

                                    jsonObj = JSON.parse(body);

                                    console.log('--2--> jsonObj: ', jsonObj);

                                    if (jsonObj) {

                                        setTimeout(function () {
                                            session.send(
                                                "Thank you, I have created a ticket for you. The ticket id is " + jsonObj.TicketNo + ". Someone from IT department will attend your problem within 24 hours.");
                                        }, 10000);

                                    } else {
                                        setTimeout(function () {
                                            session.send(
                                                'Unable to create a ticket for you. Please try after some time. Sorry for the inconvenience.');
                                        }, 10000);
                                    }

                                } else {

                                    setTimeout(function () {
                                        session.send(
                                            'Unable to create a ticket for you. Please try after some time. Sorry for the inconvenience.');
                                    }, 9000);

                                }

                            });

                        }

                    } else {
                        setTimeout(function () {
                            session.send('Sorry, I am unable to figure out the Asset ID in our asset list.');
                        }, 6000);
                    }
                } else {
                    setTimeout(function () {
                        session.send('Sorry, I am unable to figure out the Asset ID in our asset list.');
                    }, 6000);
                }
            });


        }

    } else {
        session.send('Please begin your conversation, saying " Hi / Hello " ');
    }

    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);

});

intents.matches('Not My PC, Got IT for Testing', function (session, args) {

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        session.send(
            'I am afraid I cannot find the Asset ID. Can you please figure out yourself and then come back to me?');

    } else {
        session.send('Please begin your conversation, saying " Hi / Hello " ');
    }
    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);

});



intents.matches('Figure Out The Testing Asset Id', function (session, args) {

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        session.send('Thanks, waiting for you !');

    } else {
        session.send('Please begin your conversation, saying  " Hi / Hello " ');
    }

    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);

});


intents.matches('Can\'t Figure Out The Testing Asset Id', function (session, args) {

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        var cards = [];
        var card =
            new builder.HeroCard(session)
                .title('Sorry for the inconvenience.')
                .subtitle(
                'However, I will escalate the issue to a human service executive that will contact you as soon as possible.')
                .text(
                'In case this is very urgent, you may call our toll free number +1-800-123-4567 and follow the voice menu options to reach out to our call center executive. Good day!')

        cards.push(card);

        var reply = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards);

        session.send(reply);

    } else {
        session.send('Please begin your conversation, saying " Hi / Hello " ');
    }


    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);

});

intents.matches('Cryptic Request', function (session, args) {

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        var fulfillment = builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
        if (fulfillment && fulfillment.entity != '') {
            var speech = fulfillment.entity;
            session.send(speech);
        } else {
            session.send('Sorry...Could you say that again ?');
        }

    } else {
        session.send('Please begin your conversation, saying " Hi / Hello " ');
    }
    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);
});



// Enabling SMALL TALK

intents.onDefault(function (session, args) {
    console.log(' -----> map.get(prev_intent): ', map.get('prev_intent'));
    console.log(' -----> map.get(prev_input): ', map.get('prev_input'));

    session.sendTyping();

    /*
    if (typeof map.get('prev_intent') === 'undefined' && typeof map.get('prev_input') === 'undefined') {
        session.send("Hello, I am Liz, a virtual agent for IT related services.  At the moment, I can help you to fix your problems related to laptop and desktop and can create a ticket if needed. For all other queries, you may want to call the IT helpdesk toll free number 1-800-123-4567.  How can I help you now ?");
    } else  */

    if (typeof map.get('prev_intent') !== 'undefined' && map.get('prev_intent') &&
        (map.get('prev_intent') == 'Get N Validate Asset Id' ||
            map.get('prev_intent') == 'Yes Computer Issue')) {
        session.send('Asset ID is invalid. Please try again with the proper one.');

    } else {
        var fulfillment =
            builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');

        if (fulfillment && fulfillment.entity != '') {
            var speech = fulfillment.entity;
            session.send(speech);
        } else {
            session.send('Sorry...I couldn\'t understand. ');
            setTimeout(function () {
                session.send('Please ask anything relevant to IT helpdesk.');
            }, 3000);
        }
    }

    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);
});

require('./admin.js')(intents,bot,request);
