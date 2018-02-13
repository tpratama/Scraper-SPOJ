const request = require('superagent');
const cheerio = require('cheerio');
const bluebird = require('bluebird');
const moment = require('moment');
const _ = require('lodash');

const scraper = require('./scraper-core');
const config = require('./config.json');
const csvMaker = require('./csvMaker');

const generateUrl = (problem, user, offset) => {
    let url = `www.spoj.com/status/$problem,$user/all/start=$offset`;

    url = _.replace(url, '$problem', problem);
    url = _.replace(url, '$user', user);
    url = _.replace(url, '$offset', offset);

    return url;
}

const users = config.users;
const problems = config.problems;
const startDate = config.start_date;
const endDate = config.end_date;

_.forEach(problems, (problem) => {
    let problemsRecap = {
        problem: problem,
        solutions: []
    };
    let scrapeProcess = [];
    _.forEach(users, (user) => {
        let offset = 0;
        let page = 1;
        let endOfPage = false;

        console.log(`Get submission ${problem} - ${user}, offset ${offset}`);
        
        const recursiveGet = () => {
            const currentUrl = generateUrl(problem, user, offset);
            return scraper.getAllSolution(currentUrl, startDate, endDate)
                .then((res) => {
                    //enhance res
                    res.user = user;
                    res.page = page;
                    res.problem = problem;
                    res.solutions = _.map(res.solutions, (solution) => {
                        solution.user = user;
                        return solution;
                    });
                    problemsRecap.solutions = _.concat(problemsRecap.solutions, res.solutions);
                    
                    if (!res.endOfPage) {
                        offset += 20;
                        page++;
            
                        return recursiveGet();
                    }
                    return;
                })
                .catch((err) => console.log);
        }
        scrapeProcess = _.concat(scrapeProcess, recursiveGet());
    });
    bluebird.all(scrapeProcess)
        .then(() => {
            let filePath = './recap/$filename.csv';
            filePath = _.replace(filePath, '$filename', problemsRecap.problem);
            csvMaker.createCsv(filePath, problemsRecap.solutions);
        });
});
