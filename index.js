const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const Telegraf = require("telegraf");
const bot = new Telegraf("1395527061:AAEMPOUJm5-dl3B_wZE1H0JVdaPcUa8BD2E");
const mail = new Telegraf("1643407538:AAEZPLD_rm9PvHhQKAo8SQzof-GlKg43eGs");
const db = new JsonDB(new Config("./authDB/authDB", true, false, "/"));

bot.start((ctx) => {
	try {
		if(db.getData(`/${ctx.from.username}/photo`) == "null"){
			ctx.reply("Welcome back! " + ctx.from.username + "\n\nAccount Information:\nDescription - " + db.getData(`/${ctx.from.username}/description`) + "\nChatId - " + db.getData(`/${ctx.from.username}/chatId`) + "\nMoney - £" + db.getData(`/${ctx.from.username}/money`) + " each");
			return true;
		}
		ctx.replyWithPhoto({url: `${db.getData(`/${ctx.from.username}/photo`)}`}, {caption: "Welcome back! " + ctx.from.username + "\n\nAccount Information:\nDescription - " + db.getData(`/${ctx.from.username}/description`) + "\nChatId - " + db.getData(`/${ctx.from.username}/chatId`) + "\nMoney - £" + db.getData(`/${ctx.from.username}/money`) + " each"});
		console.log(ctx.from);
	}catch(error){
		ctx.reply("You've don't have account try /register <password> to create new account!");
	}
});

bot.command("show", (ctx) => {
	let args = ctx.message.text.split(" ");
	if(db.getData(`/${ctx.from.username}/rank`) == "guest"){
		ctx.reply("You don't have permission to use this command!");
		return true;
	}
	if(args.length == 1){
        ctx.reply("Usage /show <username>");
        return true;
	}
	ctx.reply(db.getData(`/${args[1]}`));
});

bot.command("register", (ctx) => {
	let args = ctx.message.text.split(" ");
	if(args.length == 1){
		ctx.reply("Usage /register <new password> <photo-link=[null/fill]>");
		return true;
	}
	if(args.length == 2){
		db.push(`/${ctx.from.username}`, { "description": "Hey there! I am using AuthDB.", "chatId": `${ctx.chat.id}`, "password": `${args[1]}`, "code": 0, "photo": "null", "rank": "guest", "money": 1000});
		ctx.reply("Your account has created!");
		return true;
	}
	db.push(`/${ctx.from.username}`, { "description": "Hey there! I am using AuthDB.", "chatId": `${ctx.chat.id}`, "password": `${args[1]}`, "code": 0, "photo": `${args[2]}`, "rank": "guest", "money": 1000});
	ctx.reply("Your account has created!");
});

bot.command("login", (ctx) => {
	let args = ctx.message.text.split(" ");
	if(args.length == 1){
		ctx.reply("Usage /login <password>");
		return true;
	}
	if(args[1] == db.getData(`/${ctx.from.username}/password`)){
		ctx.reply("You've logged!");
		return true;
	}
	ctx.reply("Wrong password! If you forget your password, you can ask /forget to find your password.");
});

bot.command("forget", (ctx) => {
	let code = getRandomInt(654321, 5);
    let data = db.getData(`/${ctx.from.username}/chatId`);
	db.push(
	    `/${ctx.from.username}`, {
		    "description": `${db.getData(`/${ctx.from.username}/description`)}`,
		    "chatId": `${db.getData(`/${ctx.from.username}/chatId`)}`,
		    "password": `${db.getData(`/${ctx.from.username}/password`)}`,
		    "code": code,
		    "photo": `${db.getData(`/${ctx.from.username}/photo`)}`,
		    "rank": `${db.getData(`/${ctx.from.username}/rank`)}`,
		    "money": `${db.getData(`/${ctx.from.username}/money`)}`
		}
    );
	mail.telegram.sendMessage(data, "Message from @FrogasBot\nUsage /password <your-code> to get your password showed from @FrogasBot.\nYour code is: " + code, {
        reply_markup: {
            inline_keyboard: [
                [{ text: "⇣  Delete", callback_data: "Delete" }, { text: "⇡  Reply", callback_data: "Reply" }]
		    ]
	    }
    });
});

bot.command("password", (ctx) => {
	let args = ctx.message.text.split(" ");
	if(args[1] == db.getData(`/${ctx.from.username}/code`)){
		ctx.reply("Your password is: " + db.getData(`/${ctx.from.username}/password`));
		return true;
	}
	ctx.reply("Wrong verification code!");
});

bot.command("logout", (ctx) => {
	ctx.reply("You've has logout in your account has removed!");
	db.delete(`/${ctx.from.username}`);
	db.save();
});

bot.command("rank", (ctx) => {
	ctx.reply("Your money: £" + db.getData(`/${ctx.from.username}/money`) + " each", {
		reply_markup: {
			inline_keyboard: [
			    [{ text: "Operator Rank", callback_data: "OPRank" }]
			]
		}
    });
});

bot.action("OPRank", (ctx) => {
	ctx.editMessageText("Your money: £" + db.getData(`/${ctx.from.username}/money`) + " each\nPrice: £500", {
		reply_markup: {
			inline_keyboard: [
			    [{ text: "BUY", callback_data: "BUYOP" }]
			]
		}
    }, ctx.chat.id, ctx.message_id, ctx.inline_message_id);
});

bot.action("BUYOP", (ctx) => {
	if(myMoney(ctx.from.username) >= 500){
	    reduceMoney(ctx.from.username, 500);
	    ctx.editMessageText("Success!", {}, ctx.chat.id, ctx.message_id, ctx.inline_message_id);
	}else{
		ctx.editMessageText("Error!", {}, ctx.chat.id, ctx.message_id, ctx.inline_message_id);
	}
});

bot.command("money", (ctx) => {
	let args = ctx.message.text.split(" ");
	if(args.length == 1){
		ctx.reply("Your money: £" + myMoney(ctx.from.username));
		return true;
	}
	if(args[1] == "set"){
		if(args.length == 2){
			ctx.reply("Usage /money set <username> <amount>");
			return true;
		}
		if(args.length == 3){
			ctx.reply("Usage /money set <username> <amount>");
			return true;
		}
		setMoney(args[2], args[3]);
		ctx.reply("Successfully set " + args[2] + " to " + args[3]);
	}
	if(args[1] == "give"){
		if(args.length == 2){
			ctx.reply("Usage /money give <username> <amount>");
			return true;
		}
		if(args.length == 3){
			ctx.reply("Usage /money give <username> <amount>");
			return true;
		}
		addMoney(args[2], args[3]);
		ctx.reply("Successfully gave " + args[2] + " for " + args[3]);
	}
	if(args[1] == "pay"){
		if(args.length == 2){
			ctx.reply("Usage /money pay <to-username> <amount>");
			return true;
		}
		if(args.length == 3){
			ctx.reply("Usage /money pay <to-username> <amount>");
			return true;
		}
		reduceMoney(ctx.from.username, args[3]);
		addMoney(args[2], args[3]);
		ctx.reply("Successfully pay " + args[2] + " for " + args[3]);
	}
});

function myMoney(player){
	return db.getData(`/${player}/money`);
}

function setMoney(player, amount){
	db.push(
	    `/${player}`, {
		    "description": `${db.getData(`/${player}/description`)}`,
		    "chatId": `${db.getData(`/${player}/chatId`)}`,
		    "password": `${db.getData(`/${player}/password`)}`,
		    "code": `${db.getData(`/${player}/code`)}`,
		    "photo": `${db.getData(`/${player}/photo`)}`,
		    "rank": `${db.getData(`/${player}/rank`)}`,
		    "money": amount
		}
    );
}

function reduceMoney(player, amount){
	result = db.getData(`/${player}/money`) - amount;
	db.push(
	    `/${player}`, {
		    "description": `${db.getData(`/${player}/description`)}`,
		    "chatId": `${db.getData(`/${player}/chatId`)}`,
		    "password": `${db.getData(`/${player}/password`)}`,
		    "code": `${db.getData(`/${player}/code`)}`,
		    "photo": `${db.getData(`/${player}/photo`)}`,
		    "rank": "operator",
		    "money": result
		}
    );
}

function addMoney(player, amount){
	money1 = db.getData(`/${player}/money`);
	money2 = amount;
	result = money1+money2;
	db.push(
	    `/${player}`, {
		    "description": `${db.getData(`/${player}/description`)}`,
		    "chatId": `${db.getData(`/${player}/chatId`)}`,
		    "password": `${db.getData(`/${player}/password`)}`,
		    "code": `${db.getData(`/${player}/code`)}`,
		    "photo": `${db.getData(`/${player}/photo`)}`,
		    "rank": `${db.getData(`/${player}/rank`)}`,
		    "money": result
		}
    );
}

function getRandomInt(min, max){
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

bot.launch();
