const PORT = 8000;
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = express();
const mongoose = require("mongoose");
const cors = require('cors');
const xlsx = require('node-xlsx');
app.use(cors());
app.use(express.json());


const url = 'https://zavarovanec.zzzs.si/wps/portal/portali/azos/ioz/ioz_izvajalci';
const currentMonthNum = new Date().getMonth() + 1;

const scrapeZZZS = () => {
    return new Promise(resolve => {
        axios(url)
            .then(response => {
                const html = response.data;
                const $ = cheerio.load(html);
                const articles = [];
                const d = $('.datoteke', html);
                $('li', d).each(function () { //<-- cannot be a function expression
                    // console.log($(this).text())
                    const date = $(this).text()
                        .replace(/(\r\n|\n|\r)/gm, "")
                        .split(", ")[0]
                        .trim();
                    const title = $(this).text()
                        .replace(/(\r\n|\n|\r)/gm, "")
                        .split(", ")[1]
                        .trim();
                    const url = $(this)
                        .find('a')
                        .attr('href')
                        .replace(/(\r\n|\n|\r)/gm, "")
                        .trim();
                    articles.push({
                        date,
                        title,
                        url: `https://zavarovanec.zzzs.si${url}`
                    });
                });
                resolve(articles);
            }).catch(err => console.log(err))
    });
}


const downloadFiles = (url, date, title) => {
    let dir = `./downloads-${date}`;
    const path = `${dir}/${title}.xlsx`;
    let f = false;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    https.get(url, (res) => {
        const writeStream = fs.createWriteStream(path);
        res.pipe(writeStream);

        writeStream.on("finish", () => {
            writeStream.close();
            f = true
            // console.log(`Download ${title} Completed`);
        });
    });
        // Parse a buffer
        const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(path));
        // Parse a file
        workSheetsFromFile = xlsx.parse(path)[0];
    
        return workSheetsFromFile;
}


app.get('/', function (req, res) {
    res.json('This is my webscraper');
})

app.get('/results', async (req, res) => {
    res.json(await scrapeZZZS());

})

app.get('/download/current', async (req, res) => {
    const currentData = await scrapeZZZS();
    const fData = currentData.filter(data => {
        return currentMonthNum.toString() == data.date.split(".")[1];
    })
    fData.forEach(element => {
        downloadFiles(element.url, `${currentMonthNum}-${new Date().getFullYear()}`, element.title)
    });
    res.json(fData);
})

app.get('/download/:id', async (req, res) => {
    const id = req.params.id;
    const currentData = await scrapeZZZS();
    const responseArray = [];
    const fData = currentData.filter(data => {
        return id.toString() == data.date.split(".")[1];
    })
    fData.forEach(element => {
        responseArray.push(downloadFiles(element.url, `${id}-${new Date().getFullYear()}`, element.title));
    });
    res.json(responseArray);
})


app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));