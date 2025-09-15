const { Message, BaseInteraction } = require('discord.js');

class BotError extends Error{
    constructor(message){
        super(message);
        this.name = this.constructor.name;
    }


}

class DatabaseError extends BotError{};
class FetchingError extends BotError{};
class CollectorError extends BotError{};
class FalseInput extends BotError{};

class ErrorUnit{
    static async throwError(err, msg, errMsg = `يبدو أن هناك خطأ ما`){
        let response = '';
        try {
            if(err){
                switch (err.name){
                    case 'DatabaseError':
                        response = 'حدث خطأ اثناء الإتصال بقاعدة البيانات ';
                        break;
                    case 'FetchingError':
                        response = 'حدث خطأ اثناء الإتصال ب: API';
                        break;
                    case 'CollectorError':
                        response = 'حدث خطأ اثناء تصفح البيانات ';
                        break;  
                    case 'StoryError':
                        response = 'حدث خطأ اثناء عرض القصة ';
                        break; 
                    case 'FalseInput':
                        response = `يرجى استخدام الأمر بالشكل الصحيح!!\nإطبع الأمر \`مساعدة\` \`${err.message}\` للشرح.`;
                        break;       
                    default:
                        response = errMsg;            
                }
            }else{
                response = errMsg;
            }
            let responseObj = null;
            if(msg instanceof Message){
                responseObj =  await msg.reply(`${msg.author}\n${response} 🥲`);
            }else if(msg instanceof BaseInteraction){
                responseObj = await msg.editReply(`${msg.user}\n${response} 🥲`);
            }      
            console.error(err);      
            await deleteError(responseObj, msg);
            return;

        } catch (error) {
            console.error(err);
        }
    }
}

async function deleteError(obj, msg){
    setTimeout(()=>{
        obj.delete().catch(async err => {
            await ErrorUnit.throwError(err, msg, 'حدث خطأ أثناء محاولة حذف رسالة الخطأ');
        })
    }, 4_000)
}

module.exports = { DatabaseError, FetchingError, CollectorError, FalseInput, ErrorUnit };
