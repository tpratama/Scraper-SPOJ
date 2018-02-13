const request = require('superagent');
const cheerio = require('cheerio');
const bluebird = require('bluebird');
const moment = require('moment');
const _ = require('lodash');

exports.getAllSolution = (url, startDate, endDate) => {
    return request.get(url)
        .then((res) => {
            const $ = cheerio.load(res.text);
            const $rows = $('tbody').children('tr');
            const $pagination = $('.pagination').children('li');

            let endOfPage = false;

            _.forEach($pagination, ($button) => {
                const insideBtn = $($button).children();
                _.forEach(insideBtn, (btn) => {
                    const btnText = $(btn).text();
                    if (btnText === 'Next') {
                        const parent = $(btn)[0].name;
                        if (parent !== 'a') {
                            endOfPage = true;
                        }
                    }
                });
            });

            
            const currSolutions = _.reduce($rows, (acc, $row) => {
                const time = _.trim($($row).find('.stime').first().text());
                const memory = _.trim($($row).find('.smemory').first().text());
                const date = _.trim($($row).find('.status_sm').first().text());
                const status = _.trim($($row).find('.statusres').first().text());

                if (moment(date, moment.ISO_8601).isBetween(startDate, endDate)) {
                    return _.concat(acc,{
                        date: date,
                        time: time,
                        memory: memory,
                        status: status,
                    });
                }

                return acc;
            }, []);

            return {
                url: url,
                endOfPage: endOfPage,
                solutions: currSolutions
            };
        })
        .catch((err) => {
            console.log(err);
        });
}