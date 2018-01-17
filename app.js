/*
  Project : ITSM-Helpdesk-BOT
  Copyright: Congruent Info Tech
  Initiated By: Ramanathan, Oct 2017
  Collaborator: Vijay, Oct 2017
  Purpose: This is server side request processor cum back-end (sails) wrapper
*/


// Code Starts - By Ramanathan

var restify = require('restify');
var builder = require('botbuilder');
var apiairecognizer = require('api-ai-recognizer');
var HashMap = require('hashmap');
var map = new HashMap();
var mysql = require('mysql');
var request = require('request'); //var request = require('request');

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
        if(session.message.text.toLowerCase().indexOf("printer") >= 0 || session.message.text.toLowerCase().indexOf("scanner") >= 0 || session.message.text.toLowerCase().indexOf("tablet") >= 0 || session.message.text.toLowerCase().indexOf("phone") >= 0
            || session.message.text.toLowerCase().indexOf("mobile") >= 0 || session.message.text.toLowerCase().indexOf("fax") >= 0 || session.message.text.toLowerCase().indexOf("iPad") >= 0 || session.message.text.toLowerCase().indexOf("iPhone") >= 0){

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
        if(session.message.text.toLowerCase().indexOf("printer") >= 0 || session.message.text.toLowerCase().indexOf("scanner") >= 0 || session.message.text.toLowerCase().indexOf("tablet") >= 0 || session.message.text.toLowerCase().indexOf("phone") >= 0
            || session.message.text.toLowerCase().indexOf("mobile") >= 0 || session.message.text.toLowerCase().indexOf("fax") >= 0 || session.message.text.toLowerCase().indexOf("iPad") >= 0 || session.message.text.toLowerCase().indexOf("iPhone") >= 0){
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

            if(pcGenericFulfillment == null && pcSpecificFulfillment == null){
                
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
        if(assetId == '' || typeof assetId === 'undefined'){
            
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
               var url = "http://"+backEndSystemIPPort+"/api/helpdesk/asset/validateAsset?assetId="+assetId+"&userId="+userId;
               console.log('--First--> url: ',url);
                request(url, function (error, response, body) {
                    console.log('------> error: ',error);
                    
                    if (!error && response.statusCode == 200) {
                       
                        var jsonObj = JSON.parse(body);
                       
                        console.log('----> jsonObj: ',jsonObj);

                        if(jsonObj.results){
                            console.log('----> jsonObj.results - asset_id: ',jsonObj.results[0].asset_id);
                            console.log('----> jsonObj.results - asset_name: ',jsonObj.results[0].asset_name);
                                
                            if(jsonObj.results[0].asset_id && jsonObj.results[0].asset_name){
                                    
                                    setTimeout(function () {
                                        session.send(
                                            'OK, I am able to figure out the Asset ID in our asset list.');
                                    }, 6000);
                                    session.sendTyping();
                                    //Call API for Ticket Generation
                                    url = "http://"+backEndSystemIPPort+"/api/helpdesk/userTicket/create?ticket_title="+map.get('ticket_title')+"&ticket_desc="+map.get('ticket_desc')+"&priority=1&severity=1&status=1&asset=ram-lp&created_by=S8888";
                                    console.log('--Second--> url: ',url);
                                    
                                    request(url, function (error, response, body) {
                                        console.log('--error: ',error);
                                        
                                        if (!error && response.statusCode == 200) {

                                            jsonObj = JSON.parse(body);
                                            
                                            console.log('--2--> jsonObj: ',jsonObj);

                                                if(jsonObj){

                                                    setTimeout(function () {
                                                        session.send(
                                                            "Thank you, I have created a ticket for you. The ticket id is "+jsonObj.TicketNo+". Someone from IT department will attend your problem within 24 hours.");
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
            
            var url = "http://"+backEndSystemIPPort+"/api/helpdesk/asset/getAssetByUser?&userId="+userId;
            console.log('----> url: ',url);
             request(url, function (error, response, body) {
                 console.log('------> error: ',error);
                 
                 if (!error && response.statusCode == 200) {
                    
                     var jsonObj = JSON.parse(body);
                    
                     console.log('----> jsonObj: ',jsonObj);

                     if(jsonObj.results){
                         console.log('----> jsonObj.results - asset_id: ',jsonObj.results[0].asset_id);
                         console.log('----> jsonObj.results - asset_name: ',jsonObj.results[0].asset_name);
                         var retrievedAssetFromDB = jsonObj.results[0].asset_name;
                             
                         if(jsonObj.results[0].asset_id && jsonObj.results[0].asset_name){
                                 
                                 setTimeout(function () {
                                     session.send(
                                         'OK, I am able to figure out the Asset ID in our asset list.');
                                 }, 6000);

                                 session.sendTyping();
                                 
                                 setTimeout(function () {
                                    console.log('----> retrievedAssetFromDB: ',retrievedAssetFromDB);
                                    session.send(
                                        "Your Asset id is "+retrievedAssetFromDB+".");
                                }, 9000);

                                //Call API for Ticket Generation
                                url = "http://"+backEndSystemIPPort+"/api/helpdesk/userTicket/create?ticket_title="+map.get('ticket_title')+"&ticket_desc="+map.get('ticket_desc')+"&priority=1&severity=1&status=1&asset=ram-lp&created_by=S8888";
                                console.log('--Second--> url: ',url);
                                
                                request(url, function (error, response, body) {
                                    console.log('--error: ',error);
                                    
                                    if (!error && response.statusCode == 200) {

                                        jsonObj = JSON.parse(body);
                                        
                                        console.log('--2--> jsonObj: ',jsonObj);

                                            if(jsonObj){

                                                setTimeout(function () {
                                                    session.send(
                                                        "Thank you, I have created a ticket for you. The ticket id is "+jsonObj.TicketNo+". Someone from IT department will attend your problem within 24 hours.");
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


// Code Ends By Ramanathan


// =====================================================================================================================

// Code Starts By Vijay
require('dotenv-extended').load();
var Swagger = require('swagger-client');
var Promise = require('bluebird');
var url = require('url');
var fs = require('fs');
var util = require('util');
var request = require('request');
var ignoreCase = require('ignore-case');
var http = require('http');
var PropertiesReader = require('properties-reader');
var path = require("path");

var properties = PropertiesReader(path.resolve(__dirname, 'system.properties'));

var connectorApiClient = new Swagger(
    {
        url: 'https://raw.githubusercontent.com/Microsoft/BotBuilder/master/CSharp/Library/Microsoft.Bot.Connector.Shared/Swagger/ConnectorAPI.json',
        usePromise: true
    });
    
intents.matches('Welcome Admin Intent', function (session, args) {
    console.log('----> Welcome Admin Intent<-------');
    session.sendTyping();
    session.userData = {};
    session.privateConversationData = {};
    session.conversationData = {};
    session.dialogData = {};
    console.log('session.message.user.id',session.message.user.id);
    console.log('session.message.address.user.name',session.message.address.user.name);
    var fulfillment =
        builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');

    if (fulfillment && fulfillment.entity != '') {
        var speech = fulfillment.entity;
        session.send(speech);
    } else {
        session.send('Sorry...Could you say that again ?');
    }
});

contextJson = { "name": "admin", "lifespan": 2 };

intents.matches('Show Tickets', function (session, args) {
    console.log('----> args: ', args);
    var status = '';
    var severity = '';
    var priority = '';
    var username = '';
    var statusId = '';
    var severityId = '';
    var priorityId = '';
    var userId = '';

    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'status') {
                status = args.entities[i].entity;
            }
            if (args.entities[i].type == 'severity') {
                severity = args.entities[i].entity;
            }
            if (args.entities[i].type == 'priority') {
                priority = args.entities[i].entity;
            }
            if (args.entities[i].type == 'username') {
                username = args.entities[i].entity;
            }
        }
    }
    console.log("status-" + status + " priority-" + priority + " severity-" + severity + "username-" + username);


    if (status != null && status != '') {
        console.log('status property:' + properties.get(status));
        statusId = properties.get(status);
    }
    if (severity != null && severity != '') {
        console.log('severity property:' + properties.get(severity));
        severityId = properties.get(severity);
    }
    if (priority != null && priority != '') {
        console.log('priority property:' + properties.get(priority));
        priorityId = properties.get(priority);
    }
    if (username != null && username != '') {
        username = username.replace("\'s", '');
        console.log('priority property:' + username + '-' + properties.get(username));
        userId = properties.get(username);

    }
    console.log('statusId-' + statusId + 'priorityId-' + priorityId + 'severityId-' + severityId + 'userId-' + userId);

    var url = 'http://192.168.60.222:1337/api/helpdesk/userTicket/getTickets?ticketStatus=' + statusId + '&ticketSeverity=' + severityId + '&ticketPriority=' + priorityId + '&userId=' + userId + '';
    console.log('url:-' + url);

    request(url, function (error, response, body) {
        console.log('------> body: ', body);
        if (body == undefined || body == null) {
            session.send("Server is down for maintenance. Kindly do try after some time.");
        } else {
            var jsonObj = JSON.parse(body);
            if (jsonObj.success) {
                if (jsonObj.results != null && jsonObj.results.length > 0) {
                    session.userData.curTicket = jsonObj.results;
                    //console.log('curTicket-', session.userData.curTicket);
                    var tickets = '';
                    for (var idx in jsonObj.results) {
                        var item = jsonObj.results[idx];
                        tickets = tickets + '- ' + item.id + ' &nbsp;&nbsp;&nbsp;' + item.ticket_title + '<BR>';
                    }
                    if (status == '' || status == null) {
                        session.send("**Here you go. Check down the below tickets.**<BR> &nbsp;&nbsp; <BR>" + tickets);
                    } else {
                        session.send("**Following are the tickets with '" + status + "'  status.**<BR> &nbsp;&nbsp; <BR>" + tickets);
                    }
                } else {
                    setTimeout(function () {
                        session.send("There is no tickets available rightnow.");
                    }, 6000);
                }
            } else {
                setTimeout(function () {
                    session.send("There is no tickets available rightnow.");
                }, 6000);
            }
        }

    });
});

intents.matches('Show My Tickets', function (session, args) {
    console.log('----> args: ', args);
    var status = '';
    var severity = '';
    var priority = '';
    var curUser = '';
    var statusId = '';
    var severityId = '';
    var priorityId = '';
    var userId = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'status') {
                status = args.entities[i].entity;
            }
            if (args.entities[i].type == 'severity') {
                severity = args.entities[i].entity;
            }
            if (args.entities[i].type == 'priority') {
                priority = args.entities[i].entity;
            }
            if (args.entities[i].type == 'curUser') {
                curUser = args.entities[i].entity;
            }
        }
    }
    console.log("status-" + status + " priority-" + priority + " severity-" + severity + "curUser-" + curUser);

    if (status != null && status != '') {
        console.log('status property:' + properties.get(status));
        statusId = properties.get(status);
    }
    if (severity != null && severity != '') {
        console.log('severity property:' + properties.get(severity));
        severityId = properties.get(severity);
    }
    if (priority != null && priority != '') {
        console.log('priority property:' + properties.get(priority));
        priorityId = properties.get(priority);
    }
    if (curUser != null && curUser != '') {
        userId = 'S8888';
    }
    console.log('statusId-' + statusId + 'severityId-' + severityId + 'priorityId-' + priorityId + 'userId-' + userId);

    var url = 'http://192.168.60.222:1337/api/helpdesk/userTicket/getTickets?ticketStatus=' + statusId + '&ticketSeverity=' + severityId + '&ticketPriority=' + priorityId + '&userId=' + userId + '';
    console.log('url:-' + url);

    request(url, function (error, response, body) {
        console.log('------> body: ', body);
        if (body == undefined || body == null) {
            session.send("Server is down for maintenance. Kindly do try after some time.");
        } else {
            var jsonObj = JSON.parse(body);
            if (jsonObj.success) {
                if (jsonObj.results != null && jsonObj.results.length > 0) {
                    session.userData.curTicket = jsonObj.results;
                    console.log('curTicket-', session.userData.curTicket);
                    var tickets = '';
                    for (var idx in jsonObj.results) {
                        var item = jsonObj.results[idx];
                        tickets = tickets + '- ' + item.id + ' &nbsp;&nbsp;&nbsp;' + item.ticket_title + '<BR>';
                    }
                    if (status == '' || status == null) {
                        session.send("**Here you go. Check down the below tickets.**<BR> &nbsp;&nbsp; <BR>" + tickets);
                    } else {
                        session.send("**Following are the tickets with '" + status + "'  status.**<BR> &nbsp;&nbsp; <BR>" + tickets);
                    }
                } else {
                    setTimeout(function () {
                        session.send("There is no tickets available rightnow.");
                    }, 6000);
                }
            } else {
                setTimeout(function () {
                    session.send("There is no tickets available rightnow.");
                }, 6000);
            }
        }
    });
});


intents.matches('Get Ticket Details', function (session, args) {
    console.log('----> args: ', args);
    var ticketId = '';
    var severity = '';
    var priority = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'ticketid') {
                ticketId = args.entities[i].entity;
                console.log('ticketId ', args.entities[i].entity);
            }
        }
    }
    console.log('ticketId ', ticketId);
    if (ticketId == 'undefined' || ticketId == null) {
        console.log('ticketId ', ticketId);
        ticketId = '';
    }
    var url = 'http://192.168.60.222:1337/api/helpdesk/userTicket/getTickets?ticketId=' + ticketId;
    console.log('url:-' + url);

    request(url, function (error, response, body) {
        console.log('------> body: ', body);
        if (body == undefined || body == null) {
            session.send("Server is down for maintenance. Kindly do try after some time.");
        } else {
            var jsonObj = JSON.parse(body);
            if (jsonObj.success) {
                if (jsonObj.results != null && jsonObj.results.length > 0) {
                    session.userData.curTicket = jsonObj.results;
                    console.log('curTicket-', session.userData.curTicket);
                    var tickets = '';
                    var item = jsonObj.results;
                    console.log('**Ticket ID: **' + item[0].id + '<BR>**Ticket Title: **' + item[0].ticket_title + '<BR>**Title Desc:**' + item[0].ticket_desc +  '<BR>**Status:** ' + item[0].status + '<BR> **Severity:**' + item[0].severity + '<BR> **Assigned To:**' + item[0].assigned_to + '')
                    var ticketsDetails = '**Ticket ID:** ' + item[0].id + '<BR>**Ticket Title:** ' + item[0].ticket_title + '<BR>**Title Desc:** ' + item[0].ticket_desc +  '<BR>**Status:** ' + item[0].status + '<BR>**Severity:** ' + item[0].severity + '<BR>**Assigned To:** ' + item[0].assigned_to + '';
                    session.send("**Check down the ticket details.** <BR>&nbsp;&nbsp; <BR>" + ticketsDetails);

                } else {
                    setTimeout(function () {
                        session.send("Ticket Id is not valid.");
                    }, 6000);
                }
            } else {
                setTimeout(function () {
                    session.send("Ticket Id is not valid.");
                }, 6000);
            }
        }
    });
});

intents.matches('Update Ticket Status', [function (session, args) {
    console.log('----> args: ', args);
    var ticketId = '';
    var tostatus = '';
    var priority = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'ticketid') {
                ticketId = args.entities[i].entity;
                console.log('ticketId- ', args.entities[i].entity);
            }
            if (args.entities[i].type == 'status') {
                tostatus = args.entities[i].entity;
                console.log('tostatus- ', args.entities[i].entity);
            }
        }
    }
    console.log('ticketId- ', ticketId);
    var tickdetarr = '';
    if (ticketId == '' || ticketId == null) {
        console.log('updateTicket-', session.userData.updateTicket);
        if (session.userData.updateTicket == null || session.userData.updateTicket == '') {
            console.log('curTicket-', session.userData.curTicket);
            if (session.userData.curTicket != null && session.userData.curTicket.length > 0) {
                var o = session.userData.curTicket;
                tickdetarr = o.map(function (el) { console.log(el.id); return el.id; });
                console.log('tickdetarr:', tickdetarr);
            }
        } else {
            tickdetarr = session.userData.updateTicket;
        }
    } else {
        tickdetarr = ticketId;
    }
    session.userData.updateTicket = [];
    session.userData.updateTicket = tickdetarr;
    session.userData.updateStatus = [];
    session.userData.updateStatus = tostatus;
    console.log('tickdetarr- ', tickdetarr);
    console.log('toStatus- ', tostatus);

    if (tickdetarr != null && tickdetarr == '') {
        console.log('------------- ');
        session.send('Please provide us valid ticket id.');
    } else if (tostatus != null && tostatus == '') {
        console.log('================== ');
        session.send('Please provide us status to change.');
    } else {
        console.log('!!!!!!!!!!!!!!! ');
        session.beginDialog('updateStatusConfirmation');
    }
}]);

intents.matches('Update Ticket Status - ticketid', [function (session, args) {
    console.log('----> args: ', args);
    var ticketId = '';
    var tostatus = '';
    var priority = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'ticketid') {
                ticketId = args.entities[i].entity;
                console.log('ticketId- ', args.entities[i].entity);
            }
            if (args.entities[i].type == 'status') {
                tostatus = args.entities[i].entity;
                console.log('tostatus- ', args.entities[i].entity);
            }
        }
    }

    console.log('ticketId- ', ticketId);
    var tickdetarr = '';
    if (ticketId == '' || ticketId == null) {
        console.log('updateTicket-', session.userData.updateTicket);
        if (session.userData.updateTicket == null || session.userData.updateTicket == '') {
            console.log('curTicket-', session.userData.curTicket);
            if (session.userData.curTicket != null && session.userData.curTicket.length > 0) {
                var o = session.userData.curTicket;
                tickdetarr = o.map(function (el) { console.log(el.id); return el.id; });
            }
        } else {
            tickdetarr = session.userData.updateTicket;
        }
    } else {
        tickdetarr = ticketId;
    }
    session.userData.updateTicket = [];
    session.userData.updateTicket = tickdetarr;
    session.userData.updateStatus = [];
    session.userData.updateStatus = tostatus;
    console.log('tickdetarr- ', tickdetarr);
    console.log('toStatus- ', tostatus);

    if (tickdetarr != null && tickdetarr == '') {
        console.log('------------- ');
        session.send('Please provide us valid ticket id.');
    } else if (tostatus != null && tostatus == '') {
        console.log('================== ');
        session.send('Please provide us status to change.');
    } else {
        session.beginDialog('updateStatusConfirmation');
    }
}]);


intents.matches('Update Ticket Status - status', [function (session, args) {
    console.log('----> args: ', args);
    var ticketId = '';
    var tostatus = '';
    var priority = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'ticketid') {
                ticketId = args.entities[i].entity;
                console.log('ticketId- ', args.entities[i].entity);
            }
            if (args.entities[i].type == 'status') {
                tostatus = args.entities[i].entity;
                console.log('tostatus- ', args.entities[i].entity);
            }
        }
    }
    console.log('ticketId- ', ticketId);
    var tickdetarr = '';
    if (ticketId == '' || ticketId == null) {
        console.log('updateTicket-', session.userData.updateTicket);
        if (session.userData.updateTicket == null || session.userData.updateTicket == '') {
            console.log('curTicket-', session.userData.curTicket);
            if (session.userData.curTicket != null && session.userData.curTicket.length > 0) {
                var o = session.userData.curTicket;
                tickdetarr = o.map(function (el) { console.log(el.id); return el.id; });
            }
        } else {
            tickdetarr = session.userData.updateTicket;
        }
    } else {
        tickdetarr = ticketId;
    }
    session.userData.updateTicket = [];
    session.userData.updateTicket = tickdetarr;
    session.userData.updateStatus = [];
    session.userData.updateStatus = tostatus;
    console.log('tickdetarr- ', tickdetarr);
    console.log('toStatus- ', tostatus);

    if (tickdetarr != null && tickdetarr == '') {
        console.log('------------- ');
        session.send('Please provide us valid ticket id.');
    } else if (tostatus != null && tostatus == '') {
        console.log('================== ');
        session.send('Please provide us status to change.');
    } else {
        console.log('!!!!!!!!!!!!!!! ');
        session.beginDialog('updateStatusConfirmation');
    }
}]);

bot.dialog('updateStatusConfirmation', function (session) {
    console.log('-----updateStatusConfirmation---')
    var tostatus = session.userData.updateStatus;
    var tickdetarr = session.userData.updateTicket;
    session.send("Gonna update the status to " + tostatus + " for the ticket id:" + tickdetarr + ". Please confirm.");
    session.endDialog();
});


intents.matches('Update Ticket Status - yes', [function (session, args) {
    console.log('--->Update Ticket Status - yes<--- ');
    console.log('updateTicket-', session.userData.updateTicket);
    console.log('updateStatus-', session.userData.updateStatus);
    var status = session.userData.updateStatus;
    var tickdetarr = session.userData.updateTicket;
    if (status != null && status != '') {
        console.log('status property:' + properties.get(status));
        statusId = properties.get(status);
    }
    var url = 'http://192.168.60.222:1337/api/helpdesk/userTicket/modifyStatus?ticketId=' + tickdetarr + '&statusId=' + statusId;
    console.log('url:-' + url);

    request(url, function (error, response, body) {
        console.log('------> body: ', body);
        if (body == undefined || body == null) {
            session.send("Server is down for maintenance. Kindly do try after some time.");
        } else {
            var jsonObj = JSON.parse(body);
            if (jsonObj.success) {
                session.send('Status has been updated to ' + status + ' for ticket id:' + tickdetarr);
                //session.userData.updateTicket = {};
                //session.userData.updateStatus = {};
                session.endDialog();
            } else {
                setTimeout(function () {
                    session.send('I got with some error. Please try after sometime.');
                }, 6000);
            }
        }
    });
}]);

intents.matches('Update Ticket Status - no', [function (session, args) {
    console.log('--->Update Ticket Status - no<--- ');
    session.userData.updateTicket = {};
    session.userData.updateStatus = {};

    var fulfillment =
        builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');

    if (fulfillment && fulfillment.entity != '') {
        var speech = fulfillment.entity;
        session.send(speech);
    } else {
        session.send('Sorry...I couldnt understand');
    }
}]);

intents.matches('Assign Ticket', function (session, args) {
    console.log('----> args: ', args);
    var ticketId = '';
    var severity = '';
    var priority = '';
    var toassign = '';
    var tickdetarr = '';
    if (args.entities != null) {
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'ticketid') {
                ticketId = args.entities[i].entity;
                console.log('ticketId ', args.entities[i].entity);
            }
            if (args.entities[i].type == 'toassign') {
                toassign = args.entities[i].entity;
                console.log('toassign ', args.entities[i].entity);
            }
        }
    }

    if (ticketId == '' || ticketId == null) {
        console.log('updateTicket-', session.userData.updateTicket);
        if (session.userData.updateTicket == null || session.userData.updateTicket == '') {
            console.log('curTicket-', session.userData.curTicket);
            if (session.userData.curTicket != null && session.userData.curTicket.length > 0) {
                var o = session.userData.curTicket;
                tickdetarr = o.map(function (el) { console.log(el.id); return el.id; });
            }
        } else {
            tickdetarr = session.userData.updateTicket;
        }
    } else {
        tickdetarr = ticketId;
    }
    session.userData.updateTicket = tickdetarr;
    console.log('tickdetarr- ', tickdetarr);
    console.log('toassign- ', toassign);

    var url = 'http://192.168.60.222:1337/api/helpdesk/userTicket/modifyAssignedto?ticketId=' + tickdetarr + '&userId=' + toassign;
    console.log('url:-' + url);

    request(url, function (error, response, body) {
        console.log('------> body: ', body);
        if (body == undefined || body == null) {
            session.send("Server is down for maintenance. Kindly do try after some time.");
        } else {
            var jsonObj = JSON.parse(body);
            if (jsonObj.success) {
                session.send("Yaeh. I'ts done. Ticket " + tickdetarr + " has been assigned to " + toassign + ".");
                session.userData.updateTicket = {};
                session.userData.updateStatus = {};
                session.endDialog();
            } else {
                setTimeout(function () {
                    session.send('I got with some error. Please try after sometime.');
                }, 6000);
            }
        }
    });
});
