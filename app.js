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


// Setup Restify Server
var server = restify.createServer();

var connection = mysql.createConnection({
    host: '192.168.61.155', //localhost
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'helpdesk'
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: '3920ca45-4176-43f6-aaf6-be7b4804f750',
    appPassword: 'xonaTNP3)+dzcBQAD6844#='
});

server.listen(process.env.port || process.env.PORT || 7070, function () {
    console.log('%s listening to %s', server.name, server.url);
});


//server.post('/webhook', connector.listen());
server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);

var recognizer = new apiairecognizer('9f3aa1a87cb84cf1a3c2159110a52643');

var intents = new builder.IntentDialog({
    recognizers: [recognizer],
    intentThreshold: 0.2,
    recognizeOrder: builder.RecognizeOrder.series

});

bot.dialog('/', intents);

intents.matches('Default Welcome Intent', function (session, args) {

    session.sendTyping();

    var fulfillment =
        builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
    console.log('----> fulfillment: ', fulfillment);
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
        var fulfillment =
            builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
        if (fulfillment && fulfillment.entity != '') {
            var speech = fulfillment.entity;
            session.send(speech);
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
    console.log(' -----> args: ', args);
    console.log(' -----> map.get(prev_intent): ', map.get('prev_intent'));
    console.log(' -----> map.get(prev_input): ', map.get('prev_input'));

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        var userInput = session.message.text.toLowerCase();
        console.log(' -----> userInput: ', userInput);
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

    } else {
        session.send('Please begin your conversation, saying " Hi / Hello " ');
    }

    // set current intent as previous intent for future conversation.
    map.set('prev_intent', args.intent);
    map.set('prev_input', session.message.text);
});


intents.matches('Yes Computer Issue', function (session, args) {
    console.log(' -----> args: ', args);

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
        console.log('----> fulfillment: ', fulfillment);
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

    session.sendTyping();

    if (typeof map.get('prev_input') !== 'undefined' && map.get('prev_input')) {
        var mysql = require('mysql');

        session.sendTyping();
        console.log('----> session.message.text: ', session.message.text);
        var entityIndex = session.message.text.toLowerCase();

        if (entityIndex.indexOf('ram-lp') >= 0 ||
            entityIndex.indexOf('ram-comp') >= 0) {  // check user-name and ends with '-lp'


            session.send(' Let me check the Asset ID….');

            var selQuery =
                'select count(*) count from asset where asset_name = ? and asset_desc = \'java-ramanathan\'';
            connection.connect();

            if (connection != null) {
                connection.query(selQuery, ['ram-lp'], function (err, result) {
                    console.log(' ------- Asset name is found @ DB -------- ');
                    console.log(' err: ', err);
                    console.log(' selQuery result: ', result);

                    var stringCount = JSON.stringify(result);
                    console.log(' stringCount: ', stringCount);
                    var json = JSON.parse(stringCount);
                    console.log(' json: ', json);

                    console.log(' Closing the DB connection ........ !');
                    connection.end();

                    if (json[0].count == 1) {
                        setTimeout(function () {
                            session.send(
                                'OK, I am able to figure out the Asset ID in our asset list.');
                        }, 6000);

                        setTimeout(function () {

                            session.send(
                                'Thank you, I have created a ticket for you. The ticket id is HD003456. Someone from IT department will attend your problem within 24 hours.');
                        }, 9000);
                    } else {
                        session.send(
                            ' Asset id is not found in our asset list.... Please check again.');
                    }
                });
            }


        } else {
            // session.send(' Please enter valid laptop id.');
            session.send(' Let me check the Asset ID in our database….');
            session.sendTyping();

            var strTokens = session.message.text.toLowerCase().split(' ');


            strTokens.forEach(function (element) {

                if (element != '' &&
                    (element.indexOf('ram-lp') >= 0 ||
                        element.indexOf('ram-comp') >= 0)) {
                    connection.connect();

                    var selQuery =
                        'select count(*) count from asset where asset_name = ? and asset_desc = \'java-ramanathan\'';
                    if (connection != null) {
                        connection.query(selQuery, [element], function (err, result) {
                            console.log(' ------- Asset name is found @ DB -------- ');
                            console.log(' err: ', err);
                            console.log(' selQuery result: ', result);

                            var stringCount = JSON.stringify(result);
                            console.log(' stringCount: ', stringCount);
                            var json = JSON.parse(stringCount);
                            console.log(' json: ', json);

                            console.log(' Closing the DB connection ........ !');
                            connection.end();

                            if (json[0].count == 1) {
                                setTimeout(function () {
                                    session.send(
                                        'OK, I am able to figure out the Asset ID in our asset list.');
                                }, 6000);

                                setTimeout(function () {

                                    session.send(
                                        'Thank you, I have created a ticket for you. The ticket id is HD003456. Someone from IT department will attend your problem within 24 hours.');
                                }, 9000);

                            } else {
                                session.send(
                                    'Hmm…  It seems the given Asset ID is not in the asset list. Can you please check once again?.');
                            }
                        });
                    }
                } else {
                    session.send('Oops..! It seems the given Asset ID is invalid.');
                }
            }, this);
        }
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

            setTimeout(function () {
                session.send(
                    'OK, I could identify your PC from our database. It\'s ram-lp.');
            }, 6000);

            setTimeout(function () {

                session.send(
                    'Thank you, I have created a ticket for you. The ticket id is HD003456. Someone from IT department will attend your problem within 24 hours.');
            }, 9000);
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



// Enabling SMALL TALK

intents.onDefault(function (session, args) {

    session.sendTyping();

    if (typeof map.get('prev_intent') !== 'undefined' && map.get('prev_intent') &&
        (map.get('prev_intent') == 'Get N Validate Asset Id' ||
            map.get('prev_intent') == 'Yes Computer Issue')) {
        session.send('Asset ID is invalid. Please try again with the proper one.');

    } else {
        var fulfillment =
            builder.EntityRecognizer.findEntity(args.entities, 'fulfillment');
        console.log('fulfillment: ', fulfillment);

        if (fulfillment && fulfillment.entity != '') {
            var speech = fulfillment.entity;
            console.log('speech: ', speech);
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
var builder = require('botbuilder');
var restify = require('restify');
var Swagger = require('swagger-client');
var Promise = require('bluebird');
var url = require('url');
var fs = require('fs');
var util = require('util');
var apiai = require("apiai");
var apiairecognizer = require('api-ai-recognizer');
var request = require('request');
var ignoreCase = require('ignore-case');
var mysql = require('mysql');
var http = require('http');

var extServerOptions = {
    host: 'localhost',
    port: '1337',
    path: '/userTicket/',
    method: 'GET'
};


// Swagger client for Bot Connector API
var connectorApiClient = new Swagger(
    {
        url: 'https://raw.githubusercontent.com/Microsoft/BotBuilder/master/CSharp/Library/Microsoft.Bot.Connector.Shared/Swagger/ConnectorAPI.json',
        usePromise: true
    });



intents.matches('Tickets with Status', function (session, args) {
    console.log('----> args: ', args);
    var status = '';
    var severity = '';
    var priority = '';
    if (args.entities != null) {
        console.log('--if--> type: ', args.entities.length);
        for (var i = 0; i < args.entities.length; i++) {
            if (args.entities[i].type == 'status') {
                console.log("status--", status);
                status = args.entities[i].entity;
            }
            if (args.entities[i].type == 'severity') {
                severity = args.entities[i].entity;
            }
            if (args.entities[i].type == 'priority') {
                priority = args.entities[i].entity;
            }
        }
    }
    if (status == '' || status == null) {
        status = 'new';
    }
    console.log("status-2" + status);


    /*var entityIndex = session.message.text.toLowerCase();
    session.sendTyping();*/
    console.log("status-", status);

    var selQuery = "SELECT TICKET_ID,TICKET_TITLE FROM HELPDESK.TICKET T, HELPDESK.STATUS S WHERE T.STATUS_ID = S.STATUS_ID AND STATUS_NAME = ? ORDER BY SEVERITY_ID DESC";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, status, function (err, rows, fields) {
            console.log(" ------- SELECT LIST  -------- ");
            console.log(' err: ', err);
            console.log(' selQuery rows: ', rows);
            console.log(' selQuery rows: ', rows.length);


            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var tickets = '';
                for (var idx in json) {
                    var item = json[idx];
                    tickets = tickets + item.TICKET_ID + '-' + item.TICKET_TITLE + '<BR>';
                }
                session.send("Please find the below recent tickets for the status '" + status + "' <Br>" + tickets);
            }

            console.log(' Closing the DB connection ........ !');
            connection.end();
        });
    }
});


intents.matches('Tickets with Status & Priority', function (session, args) {
    console.log('----> args: ', args);
    var status = '';
    var severity = '';
    var priority = '';
    if (args.entities != null) {
        console.log('--if--> type: ', args.entities.length);
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
        }
    }
    if (status == '' || status == null) {
        status = 'new';
    }
    if (priority == '' || priority == null) {
        priority = 'critical';
    }

    

    console.log("status-" + status + " priority-" + priority + " severity-" + severity);

    var params = [status, priority];
    var selQuery = "SELECT TICKET_ID,TICKET_TITLE FROM HELPDESK.TICKET T, HELPDESK.PRIORITY P, HELPDESK.STATUS S WHERE T.PRIORITY_ID =  P.PRIORITY_ID  AND T.STATUS_ID=S.STATUS_ID AND S.STATUS_NAME = ? AND P.PRIORITY_NAME = ?  ORDER BY SEVERITY_ID DESC";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, params, function (err, rows) {
            console.log(" ------- SELECT LIST  -------- ");
            console.log(' err: ', err);
            console.log(' selQuery rows: ', rows);
            if (err) {
                console.log('error', err.message);
                throw err;
            }
            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var tickets = '';
                for (var idx in json) {
                    var item = json[idx];
                    tickets = tickets + item.TICKET_ID + '-' + item.TICKET_TITLE + '<BR>';
                }
                console.log('tickets:', tickets);
                session.send("Please find the below " + priority + " priority tickets for the status '" + status + "'. <Br>" + tickets);
            } else {
                session.send("You dont have any tickets.");
            }

            console.log(' Closing the DB connection ........ !');
            connection.end();
        });
    }
});


intents.matches('Tickets with Status & Severity', function (session, args) {
    console.log('----> args: ', args);
    var status = '';
    var severity = '';
    var priority = '';
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
        }
    }
    if (status == '' || status == null) {
        status = 'new';
    }
    if (severity == '' || severity == null) {
        severity = 'critical';
    }

    
    console.log("status-" + status + " priority-" + priority + " severity-" + severity);

    var params = [status, severity];
    var selQuery = "SELECT TICKET_ID,TICKET_TITLE FROM HELPDESK.TICKET T, HELPDESK.SEVERITY SE , HELPDESK.STATUS S WHERE T.SEVERITY_ID =  SE.SEVERITY_ID AND  T.STATUS_ID=S.STATUS_ID AND S.STATUS_NAME = ?  AND  SE.SEVERITY_NAME = ? ORDER BY T.PRIORITY_ID DESC";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, params, function (err, rows) {
            console.log(" ------- SELECT LIST  -------- ");
            console.log(' err: ', err);
            console.log(' selQuery rows: ', rows);
            console.log(' selQuery rows length: ', rows.length);

            if (err) {
                console.log('error', err.message);
                throw err;
            }
            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var tickets = '';
                for (var idx in json) {
                    var item = json[idx];
                    tickets = tickets + item.TICKET_ID + '-' + item.TICKET_TITLE + '<BR>';
                    console.log('$$$ item: ', item);
                }
                session.send("Please find the below " + severity + "severity tickets for the status '" + status + "'. <Br>" + tickets);
            } else {
                session.send("You dont have any tickets.");
            }
            console.log(' Closing the DB connection ........ !');
            connection.end();
        });
    }
});


intents.matches('My Tickets', function (session, args) {
    console.log('----> args: ', args);
    var status = '';
    var severity = '';
    var priority = '';
    var curUser = '';
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
                curUser = 'vijay';
            }
        }
    }
    if (status == '' || status == null) {
        status = 'new';
    }
    if (severity == '' || severity == null) {
        severity = '%';
    }
    if (priority == '' || priority == null) {
        priority = '%';
    }

    console.log("status-" + status + " priority-" + priority + " severity-" + severity);
    
    var params = [status, severity, priority, curUser];

    var selQuery = "SELECT TICKET_ID,TICKET_TITLE FROM HELPDESK.TICKET T, HELPDESK.STATUS S,  HELPDESK.SEVERITY SE, HELPDESK.PRIORITY P WHERE T.STATUS_ID = S.STATUS_ID AND T.SEVERITY_ID =  SE.SEVERITY_ID AND  T.PRIORITY_ID = P.PRIORITY_ID AND S.STATUS_NAME LIKE ? AND SE.SEVERITY_NAME LIKE ? AND P.PRIORITY_NAME LIKE ? AND T.ASSIGNED_TO = ? ORDER BY T.SEVERITY_ID DESC";
    connection.connect();
    if (connection != null) {
        //connection.query(selQuery, status, severity, function (err, rows, fields) {
        connection.query(selQuery, params, function (err, rows) {
            console.log(" ------- SELECT LIST  -------- ");
            console.log(' err: ', err);
            console.log(' selQuery rows: ', rows);
            console.log(' selQuery rows length: ', rows.length);
            if (err) {
                console.log('error', err.message);
                throw err;
            }
            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var tickets = '';
                for (var idx in json) {
                    var item = json[idx];
                    tickets = tickets + item.TICKET_ID + '-' + item.TICKET_TITLE + '<BR>';
                    console.log('$$$ item: ', item);
                }
                session.send("Please find the below " + severity + " priority tickets for the status " + status + ". <Br>" + tickets + '-');
            } else {
                session.send("You dont have any tickets.");
            }
            console.log(' Closing the DB connection ........ !');
            connection.end();
        });
    }
});


intents.matches('Ticket Details', function (session, args) {
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
    var selQuery = "SELECT TICKET_ID,TICKET_TITLE,S.STATUS_NAME,SE.SEVERITY_NAME, T.TICKET_DESC,T.ASSIGNED_TO,T.ASSET_ID FROM HELPDESK.TICKET T, HELPDESK.SEVERITY SE, HELPDESK.PRIORITY P, HELPDESK.STATUS S WHERE T.SEVERITY_ID =  SE.SEVERITY_ID AND  T.STATUS_ID=S.STATUS_ID AND T.PRIORITY_ID = P.PRIORITY_ID AND T.TICKET_ID=?";
    connection.connect();
    if (connection != null) {
        connection.query(selQuery, ticketId, function (err, rows, fields) {
            console.log(" ------- SELECT LIST  -------- ");
            console.log(' err: ', err);
            console.log(' selQuery rows: ', rows);
            console.log(' selQuery rows length: ', rows.length);

            if (rows.length > 0) {
                var string = JSON.stringify(rows);
                var json = JSON.parse(string);
                var ticketsDetails = 'Ticket ID: ' + json[0].TICKET_ID + '<BR> Ticket Title: ' + json[0].TICKET_TITLE + '<BR> Title Desc: ' + json[0].STATUS_NAME + '<BR> Severity: ' + json[0].SEVERITY_NAME + '<BR> Assigned To: ' + json[0].ASSIGNED_TO;

                session.send("Please find the ticket details below <BR>" + ticketsDetails);
            } else {

                session.send("There is no ticket with this ID:" + ticketId);
            }
            console.log(' Closing the DB connection ........ !');
            connection.end();
        });
    }
});

