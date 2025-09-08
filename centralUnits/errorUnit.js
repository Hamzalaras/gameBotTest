class BotError extends Error{
    constructor(message){
        super(message);
        this.name = this.constructor.name;
    }


}

class DatabaseError extends BotError{};
class FetchingError extends BotError{};
class CollectorError extends BotError{};

class ErrorUnit{
    static async throwError(err, msg, errMsg = `يبدو أن هناك خطأ ما`){
        let response = '';
        try {
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
                default:
                    response = errMsg;            
            }
            let responseObj = null;
            if("content" in msg && "author" in msg){
                responseObj =  await msg.reply(`${msg.author}\n${response} 🥲`);
                console.error(err);
                await deleteError(responseObj);
                return;
            }
            responseObj = await msg.editReply(`${msg.user}\n${response} 🥲`);
            await deleteError(responseObj);
            return;

        } catch (error) {
            console.error(err);
        }
    }
}

async function deleteError(obj, msg){
    setTimeout(()=>{
        obj.delete().catch(async err => {
            await ErrorUnit.throwError(err, msg, 'حدث خطأ أثناء محاو');
        })
    })
}

module.exports = { DatabaseError, FetchingError, CollectorError,ScarpingError, ErrorUnit };
