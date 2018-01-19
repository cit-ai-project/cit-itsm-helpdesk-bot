/******************************************************************************* 
  Project : ITSM-Helpdesk-BOT
  Copyright: Congruent Info Tech
  Written By: Ramanathan, Oct 2017
  Purpose: This is server side request processor cum back-end (sails) wrapper
/******************************************************************************* */
var restify = require('restify');
var builder = require('botbuilder');
var apiairecognizer = require('api-ai-recognizer');

// Setup Restify Server
var server = restify.createServer();

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: '3920ca45-4176-43f6-aaf6-be7b4804f750',
    appPassword: 'xonaTNP3)+dzcBQAD6844#='
});

server.post('/api/messages', connector.listen());

var bot = new builder.UniversalBot(connector);

var recognizer = new apiairecognizer('9f3aa1a87cb84cf1a3c2159110a52643'); 

var intents = new builder.IntentDialog({
    recognizers: [recognizer],
    intentThreshold: 0.2,
    recognizeOrder: builder.RecognizeOrder.series
});

server.listen(process.env.port || process.env.PORT || 7070, function () {
    console.log('%s listening to %s', server.name, server.url);
});

bot.dialog('/', intents);

//Routing to respective modules.
require('./user.js')(intents,bot,builder);
require('./admin.js')(intents,bot,builder);
