const tradesFolder = './trades/';
let allTrades = [];
let tradeData = [];

const fs = require('fs');

//Read all trade files
fs.readdir(tradesFolder, (err, files) => {
    files.forEach(file => {
        let fileSplit = file.split(".");
        let tradeFile = {
            "trade": fileSplit[0],
            "stage": fileSplit[1] || "initial",
            "filename": file
        }
        allTrades.push(tradeFile);
    });
    // Get an array of unique trades
    let trades = [...new Set(allTrades.map(item => item.trade))];

    trades.forEach(trade => {
        let files = allTrades.filter(file => {
            return file.trade === trade;
        });

        let data = { };
        files.forEach(file => {
            let contents = {};
            switch (file.stage) {
                case "finished":
                    contents = JSON.parse(fs.readFileSync("./trades/" + file.filename, 'utf8'));
                    data.type = "Trade";
                    data.buyAmount = new Number(contents.srcamount - contents.alicetxfee).toString();
                    data.buyCurrency = contents.bob;
                    data.sellAmount = new Number(contents.destamount + contents.values[6]).toString();
                    data.sellCurrency = contents.alice;
                    data.sellFee = new Number(contents.values[6]).toString();
                    data.sellFeeCurrency = contents.alice;
                    data.exchange = "BarterDex Trades";
                    data.group = "";
                    data.comment = "";
                    data.date = new Date(contents.finishtime * 1000)
                    break;

                default:
                    break;
            }
        });
        tradeData.push(data);


    }, this);

    const replacer = (key, value) => value === null ? '' : value; // specify how you want to handle null values here
    const header = Object.keys(tradeData[0]);
    let csv = tradeData.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
    csv.unshift(header.join(','));
    csv = csv.join('\r\n');
    fs.appendFileSync("trades.csv", csv, 'utf8');
    console.log(csv);
});
