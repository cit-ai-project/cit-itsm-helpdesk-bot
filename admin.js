    /*
    Project : ITSM-Helpdesk-BOT
    Copyright: Congruent Info Tech
    Written By: Vijay, Oct 2017
    Module: Admin
    Purpose: This is server side request processor cum back-end (sails) wrapper
    Module description: This handles the intents specific to administrator (user).
    */
    module.exports = function (intents, bot, builder) {

        var PropertiesReader = require('properties-reader');
        var path = require("path");
        var properties = PropertiesReader(path.resolve(__dirname, 'system.properties'));
        var request = require('request');


        /*This intent will show the list of available ticket from the sails system
        based on status, severity, priority and user.*/
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
            console.log('session.message.user.id', session.message.user.id);
            console.log('session.message.address.user.name', session.message.address.user.name);
            var curUser = session.message.address.user.name;
            if (curUser == properties.get('adminUser')) {
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

                /*Connecting sails api to retrive tickets*/
                var url = 'https://' + properties.get('sailsUrl') + '/api/helpdesk/userTicket/getTickets?ticketStatus=' + statusId + '&ticketSeverity=' + severityId + '&ticketPriority=' + priorityId + '&userId=' + userId + '';
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
                                    tickets = tickets + '- ' + item.id + ' -- ' + item.ticket_title + '  \n';
                                }
                                if (status == '' || status == null) {
                                    session.send("**Here you go. Check down the below tickets.**  \n" + tickets);
                                } else {
                                    session.send("**Following are the tickets with '" + status + "'  status.**  \n" + tickets);
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
            } else {
                session.send('You are not eligible to access this data.');
            }
        });

        /*This intent specifically used to bring up the available tickets from sails api particular to that user.*/
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
                //userId = 'S8888';
                console.log('name:' + session.message.address.user.name);
                console.log('name:' + properties.get(session.message.address.user.name));
                userId = properties.get(session.message.address.user.name);
                
            }
            console.log('statusId-' + statusId + 'severityId-' + severityId + 'priorityId-' + priorityId + 'userId-' + userId);

            /*Connecting sails api to retrive tickets*/
            var url = 'https://' + properties.get('sailsUrl') + '/api/helpdesk/userTicket/getTickets?ticketStatus=' + statusId + '&ticketSeverity=' + severityId + '&ticketPriority=' + priorityId + '&userId=' + userId + '';
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
                            var tickets = '';
                            for (var idx in jsonObj.results) {
                                var item = jsonObj.results[idx];
                                tickets = tickets + '- **' + item.id + '** -- ' + item.ticket_title + '  \n';
                            }
                            if (status == '' || status == null) {
                                session.send("**Here you go. Check down the below tickets.**  \n" + tickets);
                            } else {
                                session.send("**Following are the tickets with '" + status + "'  status.**  \n" + tickets);
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

        /*This intent is to show up the details for given ticket ID*/
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
            if (ticketId == undefined || ticketId == null) {
                console.log('ticketId ', ticketId);
                ticketId = '';
            }
            var url = 'https://' + properties.get('sailsUrl') + '/api/helpdesk/userTicket/getTickets?ticketId=' + ticketId;
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
                            var assigned='';
                            if(item[0].assigned_to==null || item[0].assigned_to==''){
                                assigned='Not Assigned';
                            }else {
                                assigned=properties.get(item[0].assigned_to);
                            }
                            console.log('**Ticket ID: **' + item[0].id + '  \n **Ticket Title: **' + item[0].ticket_title + '  \n **Title Desc:**' + item[0].ticket_desc + '  \n **Status:** ' + item[0].status + '  \n **Severity:**' + item[0].severity + '  \n **Assigned To:**' + assigned + '')
                            var ticketsDetails = '  \n **Ticket ID:** ' + item[0].id + '  \n**Ticket Title:** ' + item[0].ticket_title + '  \n **Title Desc:** ' + item[0].ticket_desc + '  \n **Status:** ' + item[0].status + '  \n **Severity:** ' + item[0].severity + '  \n **Assigned To:** ' + assigned + '';
                            session.send("**Check down the ticket details.**   \n  \n" + ticketsDetails);

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

        /*This intent is to update the status of the ticket ID.This   has follow-up event for ticket ID and status ID validation.*/
        intents.matches('Update Ticket Status', [function (session, args) {
            console.log('----> args: ', args);
            var ticketId = '';
            var tostatus = '';
            var priority = '';
            console.log('session.message.user.id', session.message.user.id);
            console.log('session.message.address.user.name', session.message.address.user.name);
            var curUser = session.message.address.user.name;
            if (curUser == properties.get('adminUser')) {
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
                console.log('tickdetarr- ' + tickdetarr + ' | toStatus- ', tostatus);

                if (tickdetarr != null && tickdetarr == '') {
                    session.send('Please provide us valid ticket id.');
                } else if (tostatus != null && tostatus == '') {
                    session.send('Please provide us status to change.');
                } else {
                    session.beginDialog('updateStatusConfirmation');
                }
            } else {
                session.send('You are not eligible to access this data.');
            }
        }]);

        /*This intent is a follow-up event for 'Update Ticket Status' intent. 
        Here it validates the given ticket ID and prompts for missing status ID*/
        intents.matches('Update Ticket Status - ticketid', [function (session, args) {
            console.log('----> args: ', args);
            var ticketId = '';
            var tostatus = '';
            var priority = '';
            var curUser = session.message.address.user.name;
            if (curUser == properties.get('adminUser')) {
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
                        //console.log('curTicket-', session.userData.curTicket);
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
                console.log('tickdetarr- ' + tickdetarr + ' | toStatus- ', tostatus);

                if (tickdetarr != null && tickdetarr == '') {
                    session.send('Please provide us valid ticket id.');
                } else if (tostatus != null && tostatus == '') {
                    session.send('Please provide us status to change.');
                } else {
                    session.beginDialog('updateStatusConfirmation');
                }
            } else {
                session.send('You are not eligible to access this data.');
            }
        }]);

        /*This intent is a follow-up event for 'Update Ticket Status' intent. 
        Here it validates the given ticket ID and status ID and make confirmation message to update status.*/
        intents.matches('Update Ticket Status - status', [function (session, args) {
            console.log('----> args: ', args);
            var ticketId = '';
            var tostatus = '';
            var priority = '';
            var curUser = session.message.address.user.name;
            if (curUser == properties.get('adminUser')) {
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
                console.log('tickdetarr- ' + tickdetarr + ' | toStatus- ', tostatus);

                if (tickdetarr != null && tickdetarr == '') {
                    session.send('Please provide us valid ticket id.');
                } else if (tostatus != null && tostatus == '') {
                    session.send('Please provide us status to change.');
                } else {
                    session.beginDialog('updateStatusConfirmation');
                }
            } else {
                session.send('You are not eligible to access this data.');
            }
        }]);

        /*This intent is a follow-up event for 'Update Ticket Status' intent. 
        Here it makes confirmation on update status.*/
        bot.dialog('updateStatusConfirmation', function (session) {
            console.log('-----updateStatusConfirmation---')
            var tostatus = session.userData.updateStatus;
            var tickdetarr = session.userData.updateTicket;
            session.send("Gonna update the status to " + tostatus + " for the ticket id:" + tickdetarr + ". Please confirm.");
            session.endDialog();
        });

        /*This intent is a follow-up event for 'Update Ticket Status' intent. 
        Here it updates the status ID for  the particular ticketID.*/
        intents.matches('Update Ticket Status - yes', [function (session, args) {
            console.log('--->Update Ticket Status - yes<--- ');
            console.log('updateTicket-', session.userData.updateTicket);
            console.log('updateStatus-', session.userData.updateStatus);
            var status = session.userData.updateStatus;
            var tickdetarr = session.userData.updateTicket;
            var curUser = session.message.address.user.name;

            if (curUser == properties.get('adminUser')) {
                if (status != null && status != '') {
                    console.log('status property:' + properties.get(status));
                    statusId = properties.get(status);
                }
                var url = 'https://' + properties.get('sailsUrl') + '/api/helpdesk/userTicket/modifyStatus?ticketId=' + tickdetarr + '&statusId=' + statusId;
                console.log('url:-' + url);

                request(url, function (error, response, body) {
                    console.log('------> body: ', body);
                    if (body == undefined || body == null) {
                        session.send("Server is down for maintenance. Kindly do try after some time.");
                    } else {
                        var jsonObj = JSON.parse(body);
                        if (jsonObj.success) {
                            session.send('Yaeh. Its done. Now status has been updated to ' + status + ' for ticket id: ' + tickdetarr);
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
            } else {
                session.send('You are not eligible to access this data.');
            }
        }]);

        /*This intent is a follow-up event for 'Update Ticket Status' intent. 
        It for negative utterance on status update and it does nothing .*/
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

        /*This intent is to update assigned to column of user ticket.
        Here it assigns this to other user.*/
        intents.matches('Assign Ticket', function (session, args) {
            console.log('----> args: ', args);
            var ticketId = '';
            var severity = '';
            var priority = '';
            var toassign = '';
            var tickdetarr = '';
            var curUser = session.message.address.user.name;
            if (curUser == properties.get('adminUser')) {
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
                    if (session.userData.curTicket != null && session.userData.curTicket.length > 0) {
                        var o = session.userData.curTicket;
                        tickdetarr = o.map(function (el) { console.log(el.id); return el.id; });
                    } else if (session.userData.updateTicket != null || session.userData.updateTicket != '' || session.userData.updateTicket.length > 0) {
                        tickdetarr = session.userData.updateTicket;
                    } else {
                        tickdetarr = '';
                    }
                } else {
                    tickdetarr = ticketId;
                }

                session.userData.updateTicket = tickdetarr;
                console.log('tickdetarr- ', tickdetarr);
                console.log('property toassign-', properties.get(toassign));
                toassign = properties.get(toassign);
                console.log('toassign- ', toassign);
                if (tickdetarr == '' || tickdetarr == null) {
                    session.send("You don't have valid ticket ID. ");
                } else {
                    var url = 'https://' + properties.get('sailsUrl') + '/api/helpdesk/userTicket/modifyAssignedto?ticketId=' + tickdetarr + '&userId=' + toassign;
                    console.log('url:-' + url);

                    request(url, function (error, response, body) {
                        console.log('------> body: ', body);
                        if (body == undefined || body == null) {
                            session.send("Server is down for maintenance. Kindly do try after some time.");
                        } else {
                            var jsonObj = JSON.parse(body);
                            if (jsonObj.success) {
                                session.send("Yaeh. I'ts done. Ticket " + tickdetarr + " has been assigned to " + toassign + ".");
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
                }
            } else {
                session.send('You are not eligible to access this data.');
            }

        });
    }
