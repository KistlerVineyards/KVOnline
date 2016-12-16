"use strict";
var edge = require('edge');
var rx = require('rxjs');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
let subject = new rx.Subject();
let messages, def, config;
console.log('Started edge');

var marshal = edge.func({
    assemblyFile: 'KVConnector.dll',
    typeName: 'KVConnector.KVConnection', methodName: 'Invoke'
});

function init(app, data) {
    messages = app.get('messages');
    def = app.get('def');
    config = app.get('config');
    marshal(data, function (error, result) {
        if (error) {
            console.log(messages.errInitFailed);
        }
        else if (result.error) {
            console.log(JSON.stringify(result.error));
        }
        else {
            console.log(messages.messInitialized);
        }
    });
}
exports.init = init;

//push
function edgePush(res, next, id, data) {
    marshal(data, (error, result) => {
        if (error) {
            //subject.next({ res: res, id: id, data: error, next: next });
            next(error);
        } else {
            subject.next({ res: res,next: next, id: id, result: result });
        }
    });
};
exports.edgePush = edgePush;

//filter
function filterOn(id) {
    return (subject.filter(d => d.id === id));
}

//subscribtions
filterOn('authenticate').subscribe(d => {
    let result = d.result;
    let res = d.res;
    let next = d.next;
    if (result) {
        if (result.error) {
            let err = new def.NError(401, messages.errUnAuthenticated, messages.messAuthFailed);
            next(err);
        } else {
            if (result.authenticated) {
                let token = jwt.sign(result.user, config.jwtKey,{ expiresIn: config.jwtKeyExpiresIn || '1d' });
                let inactivityTimeoutSecs=config.inactivityTimeoutSecs || 300
                res.status(200).json({
                    authenticated: true,
                    token: token,
                    inactivityTimeoutSecs:inactivityTimeoutSecs
                });
            } else {
                let err = new def.NError(401, messages.errUnAuthenticated, messages.messAuthFailed);
                next(err);
            }
        }
    } else {
        let err = new def.NError(401, messages.errUnAuthenticated, messages.messAuthFailed);
        next(err);
    }
});

filterOn('forgot:passowrd').subscribe(d => {
    if (d.result) {
        if (d.result.error) {
            d.next(d.result.error);
        } else {
            let body = config.forgotPassword.mailBody;
            let emailToken = jwt.sign({ data: d.result.email }, config.jwtKey, { expiresIn: "1d" });
            //let sendPasswordUrl = `${config.host}/send/password?code=${emailToken}`;
            let createPasswordUrl = `${config.host}/create/password?code=${emailToken}`;
            createPasswordUrl = `<a href='${createPasswordUrl}'>${createPasswordUrl}</a>`;
            body = body + "  " + createPasswordUrl;
            let emailItem = config.sendMail;
            emailItem.htmlBody = body;
            emailItem.subject = config.forgotPassword.subject;
            emailItem.to = d.result.email;
            sendMail(d.res, d.next, emailItem);
        }
    } else {
        let err = new def.NError(520, messages.errUnknown, messages.messErrorUnknown);
        next(err);
    }
});

filterOn('common:result:data').subscribe(d => {
    if (d.result) {
        if (d.result.error) {
            d.next(d.result.error);
        } else {
            d.res.status(200).json(d.result);
        }
    } else {
        let err = new def.NError(520, messages.errUnknown, messages.messErrorUnknown);
        next(err);
    }
});

filterOn('common:result:no:data').subscribe(d => {
    if (d.result) {
        if (d.result.error) {
            d.next(d.result.error);
        } else {
            d.res.status(200).json({ success: true, result:d.result });
        }
    } else {
        let err = new def.NError(520, messages.errUnknown, messages.messErrorUnknown);
        next(err);
    }
});

// filterOn('new:password').subscribe(d => {
//     if (d.result) {
//         if (d.result.error) {
//             d.next(d.result.error);
//         } else {
//             d.res.status(200).json({ "new:password": true });
//         }
//     } else {
//         let err = new def.NError(520, messages.errUnknown, messages.messErrorUnknown);
//         next(err);
//     }
// });

// filterOn('create:account').subscribe(d => {
//     if (d.result) {
//         if (d.result.error) {
//             d.next(d.result.error);
//         } else {
//             d.res.status(200).json({ "create:account": true });
//         }
//     } else {
//         let err = new def.NError(520, messages.errUnknown, messages.messErrorUnknown);
//         next(err);
//     }
// });

// filterOn('save:order').subscribe(d => {
//     if (d.result) {
//         if (d.result.error) {
//             d.next(d.result.error);
//         } else {
//             d.res.status(200).json({'save:order':true});
//         }
//     } else {
//         let err = new def.NError(520, messages.errUnknown, messages.messErrorUnknown);
//         d.next(err);
//     }
// });

//send mail
function sendMail(res, next, emailItem) {
    //let decodedEmail = Buffer.from(auth, 'base64').toString();
    let emailFilter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (emailFilter.test(emailItem.to)) {
        var options = {
            host: emailItem.host,
            port: emailItem.port,
            secure: emailItem.secure, // for port 587 SSL is not required
            auth: {
                user: emailItem.fromUser,
                pass: emailItem.fromUserPassword
            }
        }
        var transporter = nodemailer.createTransport(options);
        var mailOptions = {
            from: `${emailItem.fromUserName}👥 <${emailItem.fromUser}>`,
            to: emailItem.to, // list of receivers
            subject: emailItem.subject // Subject line
            //,text: body // plaintext body
            , html: emailItem.htmlBody // html body
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                let err = new def.NError(520, messages.errSendingMail, messages.errSendingMail);
                next(err);
            } else {
                console.log('Message sent: ' + info.response);
                res.status(200).send(true);
            }
        });
    } else {
        let err = new def.NError(520, messages.errInvalidEmail, messages.errInvalidEmail);
        next(err);
    }
};
exports.sendMail = sendMail;
function getClientIp(req) {
    var ipAddress;
    // The request may be forwarded from local web server.
    var forwardedIpsStr = req.header('x-forwarded-for');
    if (forwardedIpsStr) {
        // 'x-forwarded-for' header may return multiple IP addresses in
        // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
        // the first one
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        // If request was not forwarded
        ipAddress = req.connection.remoteAddress;
    }
    return ipAddress;
};
exports.getClientIp = getClientIp;