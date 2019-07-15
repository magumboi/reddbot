const TeleBot = require('telebot');
const fs = require('fs');
const rp = require('request-promise');
const schedule = require('node-schedule');
const bot = new TeleBot('894374302:AAE-N8TMTd3zomndSoKGoy4plTp7x7dowHE');

let db = {};
let dblist = {};
let rLimit = 20;

/*schedule.scheduleJob('*!/1 * * * *', function() {
    console.log(JSON.parse(db));
    const options = 'top.json?t=day&limit=5';
    var start = new Date();
    if(db.length !== 0)
        for (var i = 0, len = db.length; i < len; i++) {
            if( db[i][schedule] === true)
                db[i][lista].split(',').forEach(function (subreddit) {
                    let messageId = db[userId].replace('id_', '');

                    console.log(`http://www.reddit.com/r/${subreddit}/${options}`);
                    //sendPlsWait(messageId);
                    rp({uri: `http://www.reddit.com/r/${subreddit}/${options}`, json: true})
                        .then(function (body) {
                            body.data.children.forEach(function (post) {

                                // reddit post data
                                let redditPost = post.data;
                                redditPost.title = redditPost.title.replace(/&amp;/g, '&');

                                // inline buttons
                                const markup = bot.inlineKeyboard([
                                    [
                                        bot.inlineButton('🌐 Reddit', {url: `https://www.reddit.com${redditPost.permalink}`}),
                                    ]
                                ]);

                                // if post is an image or if it's a gif or a link
                                if (/\.(jpe?g|png)$/.test(redditPost.url) ||
                                    redditPost.domain === 'i.reddituploads.com' ||
                                    redditPost.domain === 'i.redd.it') {
                                    // sendPlsWait(messageId);
                                    return sendImagePost(messageId, redditPost, markup);
                                } else if (redditPost.preview && redditPost.preview.images[0].variants.mp4) {
                                    // sendPlsWait(messageId);
                                    if (isGfycatPost(redditPost))
                                        return sendGfycatPost(messageId, redditPost, markup);
                                    else
                                        return sendGifPost(messageId, redditPost, markup);
                                } else {
                                    if (isImgurPost(redditPost))
                                        return sendImgurPost(messageId, redditPost, markup);
                                    else
                                        return sendMessagePost(messageId, redditPost, markup);
                                }
                            });
                        })
                        .catch(function (err) {
                            console.log(err);
                            return sendErrorMsg(messageId);
                        });
                });
        }
});*/

function updateUser(userId, subreddit, option, postNum) {
    let list = '';
    let schedule = false;
    db[userId] = {subreddit, option, postNum, list, schedule};
}

function sendRedditPostfromList(messageId) {
    //const messageId = db[userId].replace('id_','');
    const options = 'top.json?t=day&limit=5';
    var start = new Date();
    db[`id_${messageId}`]['list'].split(',').forEach(function(subreddit) {

        console.log(`http://www.reddit.com/r/${subreddit}/${options}`);
        //sendPlsWait(messageId);
        rp({uri: `http://www.reddit.com/r/${subreddit}/${options}`, json: true})
            .then(function (body) {
                body.data.children.forEach(function (post) {

                    // reddit post data
                    let redditPost = post.data;
                    redditPost.title = redditPost.title.replace(/&amp;/g, '&');

                    // inline buttons
                    const markup = bot.inlineKeyboard([
                        [
                            bot.inlineButton('🌐 Reddit', {url: `https://www.reddit.com${redditPost.permalink}`}),
                        ]
                    ]);

                    // if post is an image or if it's a gif or a link
                    if (/\.(jpe?g|png)$/.test(redditPost.url) ||
                        redditPost.domain === 'i.reddituploads.com' ||
                        redditPost.domain === 'i.redd.it') {
                        // sendPlsWait(messageId);
                        return sendImagePost(messageId, redditPost, markup);
                    } else if (redditPost.preview && redditPost.preview.images[0].variants.mp4) {
                        // sendPlsWait(messageId);
                        if (isGfycatPost(redditPost))
                            return sendGfycatPost(messageId, redditPost, markup);
                        else
                            return sendGifPost(messageId, redditPost, markup);
                    } else {
                        if (isImgurPost(redditPost))
                            return sendImgurPost(messageId, redditPost, markup);
                        else
                            return sendMessagePost(messageId, redditPost, markup);
                    }
                });
            })
            .catch(function (err) {
                console.log(err);
                return sendErrorMsg(messageId);
            });

    });
}

function sendRedditPost(messageId, subreddit, option, postNum) {
    const options = getOptions(option, rLimit);
    var start = new Date();
    console.log(`http://www.reddit.com/r/${subreddit}/${options}`);
    //sendPlsWait(messageId);
    rp({ uri: `http://www.reddit.com/r/${subreddit}/${options}`, json: true })
        .then(function (body) {
            // send error message if the bot encountered one
            if (body.hasOwnProperty('error') || body.data.children.length < 1) {
                return sendErrorMsg(messageId);
            } else if (body.data.children.length - 1 < postNum) {
                return noMorePosts(messageId);
            }

            // reddit post data
            let redditPost = body.data.children[postNum].data;
            redditPost.title = redditPost.title.replace(/&amp;/g, '&');

            // inline buttons
            const markup = bot.inlineKeyboard([
                [
                    bot.inlineButton('🌐 Reddit', { url: `https://www.reddit.com${redditPost.permalink}` }),
                    bot.inlineButton('➡️️ Next', { callback: 'callback_query_next' })
                ]
            ]);

            // if post is an image or if it's a gif or a link
            if (/\.(jpe?g|png)$/.test(redditPost.url) ||
                redditPost.domain === 'i.reddituploads.com' ||
                redditPost.domain === 'i.redd.it') {
                // sendPlsWait(messageId);
                return sendImagePost(messageId, redditPost, markup);
            } else if (redditPost.preview && redditPost.preview.images[0].variants.mp4) {
                // sendPlsWait(messageId);
                if(isGfycatPost(redditPost))
                    return sendGfycatPost(messageId, redditPost, markup);
                else
                    return sendGifPost(messageId, redditPost, markup);
            } else {
                if (isImgurPost(redditPost))
                    return sendImgurPost(messageId, redditPost, markup);
                else
                    return sendMessagePost(messageId, redditPost, markup);
            }
        })
        .catch(function (err) {
            console.log(err);
            return sendErrorMsg(messageId);
        });
}

// options
function getOptions(option, rlimit) {
    if (option === 'top') {
        return `top.json?t=day&limit=${rlimit}`;
    } else if (option === 'topw') {
        return `top.json?t=week&limit=${rlimit}`;
    } else if (option === 'topm') {
        return `top.json?t=month&limit=${rlimit}`;
    } else if (option === 'topy') {
        return `top.json?t=year&limit=${rlimit}`;
    } else if (option === 'all') {
        return `top.json?t=all&limit=${rlimit}`;
    } else if (option === 'hot') {
        return `hot.json?&limit=${rlimit}`;
    } else if (option === 'new') {
        return `new.json?&limit=${rlimit}`;
    } else {
        return `top.json?t=day&limit=${rlimit}`;
    }
}

function sendErrorMsg(messageId) {
    const errorMsg = `Couldn't find the subreddit. Use /help for instructions.`;
    return bot.sendMessage(messageId, errorMsg);
}

function sendTryAgainMsg(messageId) {
    const errorMsg = `Something went wrong, try again.`;
    return bot.sendMessage(messageId, errorMsg);
}

function sendLimitMsg(messageId) {
    const errorMsg = `Sorry, we can't show more than ${rLimit} posts for one option. Please change your subreddit or option. 

Use /help for instructions.`;
    return bot.sendMessage(messageId, errorMsg);
}

function noMorePosts(messageId) {
    const errorMsg = `No more posts. Use /help for instructions`;
    return bot.sendMessage(messageId, errorMsg);
}

function sendPlsWait(messageId) {
    const message = `Please wait...`;
    return bot.sendMessage(messageId, message);
}

function sendImagePost(messageId, redditPost, markup) {
    let url = redditPost.url;
    url = url.replace(/&amp;/g, '&');
    let caption = redditPost.title;
    return bot.sendPhoto(messageId, url, {caption, markup});
}

function sendGifPost(messageId, redditPost, markup) {
    let gifArr = redditPost.preview.images[0].variants.mp4.resolutions;
    let gif = gifArr[gifArr.length - 1].url;
    gif = gif.replace(/&amp;/g, '&');
    const caption = redditPost.title;
    return bot.sendVideo(messageId, gif, {caption, markup});
}

function isGfycatPost(redditPost) {
    if(redditPost.media)
        return redditPost.media.type === 'gfycat.com';
    return false
}

function isImgurPost(redditPost) {
    let url = redditPost.url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
    return url === 'imgur.com' || url === 'i.imgur.com';
}

function sendImgurPost(messageId, redditPost, markup) {
    let gif= redditPost.url.replace('.gifv', '.mp4');
    const caption = redditPost.title;
    return bot.sendVideo(messageId, gif, {caption, markup});
}

function sendGfycatPost(messageId, redditPost, markup) {
    let gifArr = redditPost.media.oembed.thumbnail_url;
    let gif = gifArr.substring(26).replace('-size_restricted.gif', '.mp4');
    gif = `https://giant.gfycat.com/${gif}`;
    const caption = redditPost.title;
    return bot.sendVideo(messageId, gif, {caption, markup}).catch(function (err) {
        console.log(err);
        bot.sendVideo(messageId, gifArr, {caption, markup}).catch(function (err) {
            console.log(err);
            sendTryAgainMsg(messageId);
        })
    });
}

function sendMessagePost(messageId, redditPost, markup) {
    let url = redditPost.url;
    url = url.replace(/&amp;/g, '&');
    const message = `${redditPost.title}

${url}`;
    return bot.sendMessage(messageId, message, {markup});
}

function getList(messageId,userId){
    const Msg = `Your list:
    ${db[userId]['list'].replace("\n",",")}`;
    return bot.sendMessage(messageId, Msg);
}


bot.on('text', msg => {
    const parse = "Markdown";
    let numberOfCommas = (msg.text.match(/,/g)||[]).length;
    let message = '';
    switch (msg.text) {
        case '/start':
            message = `Enter a subreddit name with an option:

*top:* Top posts from past day
*topw:* Top posts from past week
*topm:* Top posts from past month
*topy:* Top posts from past year
*all:* Top posts of all time
*hot:* Hot posts right now 
*new:* Latest posts

For example if you want to get top posts of \`/r/cats\` enter:
*cats top*

Default option is *top*, so *cats* will return top posts of \`/r/cats\` from past day.

/list makes a scheduled subreddit list, it'll send you the top 5 subreddit's post every 12 hours.`
            return bot.sendMessage(msg.from.id, message, {parse});
        case '/help':
            message = `Enter a subreddit name with an option:

*top:* Top posts from past day
*topw:* Top posts from past week
*topm:* Top posts from past month
*topy:* Top posts from past year
*all:* Top posts of all time
*hot:* Hot posts right now 
*new:* Latest posts

For example if you want to get top posts of \`/r/cats\` enter:
*cats top*

Default option is *top*, so *cats* will return top posts of \`/r/cats\` from past day.

/list makes a scheduled subreddit list, it'll send you the top 5 subreddit's post every 12 hours.`
            return bot.sendMessage(msg.from.id, message, {parse});
        case '/list':
            if(!db[`id_${msg.from.id}`])
                updateUser(`id_${msg.from.id}`, '', '', '');

            message = `OK. Send me a list of subreddits. You can update this list anytime. Please use this format:
        
dogs,cats,dankmemes,memes
        `;
            if(db[`id_${msg.from.id}`]['list']) {
                return getList(msg.from.id, `id_${msg.from.id}`);
            }else
                return bot.sendMessage(msg.from.id, message, {parse});
    }

    if(numberOfCommas >= 1) {
        const userId = `id_${msg.from.id}`;
        const messageId = msg.from.id;
        updateUser(userId, '', '', '');
        db[userId]['list'] =  msg.text;
        db[userId]['schedule'] = true;
        const message = `List updated.`;
        bot.sendMessage(msg.from.id, message, {parse});
        getList(messageId,userId);
        sendRedditPostfromList(messageId)
    } else if(msg.text.substring(0,1) !== '/') {
        const userId = `id_${msg.from.id}`;
        const messageId = msg.from.id;
        const [subreddit, option] = msg.text.toLowerCase().split(' ');
        const postNum = 0;
        sendPlsWait(messageId);
        updateUser(userId, subreddit, option, postNum);
        sendRedditPost(messageId, subreddit, option, postNum);
    }else{
        sendTryAgainMsg(msg.from.id)
    }

});

bot.on('callbackQuery', msg => {
    if (msg.data === 'callback_query_next') {
        const userId = `id_${msg.from.id}`;
        const messageId = msg.from.id;
        let subreddit = '',
            option = '';
        let postNum = 0;

        if (db[userId].hasOwnProperty('subreddit')) {
            subreddit = db[userId]['subreddit'];
        } else {
            return bot.sendMessage(messageId, 'Sorry, you should send the subreddit again');
        }

        if (db[userId]['option']) {
            option = db[userId]['option'];
        } else {
            option = 'top';
        }

        if (db[userId].hasOwnProperty('postNum')) {
            postNum = db[userId]['postNum'];
            postNum++;
        }

        db[userId]['postNum'] = postNum;

        if (postNum > rLimit - 1) {
            return sendLimitMsg(messageId);
        }
        //sendPlsWait(messageId);
        sendRedditPost(messageId, subreddit, option, postNum);
    }
});

bot.connect();