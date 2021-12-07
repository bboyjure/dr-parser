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
    }).catch(err => console.log(err))});
}

exports.scrapeZZZS = scrapeZZZS;