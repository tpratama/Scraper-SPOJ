const fs = require('fs');
const _ = require('lodash');

exports.createCsv = (filename, data) => {
    const stream = fs.createWriteStream(filename);
    stream.once('open', () => {
        stream.write('user,date,time,memory,status\n')
        _.each(data, (record) => {
            stream.write(record.user);
            stream.write(',');
            stream.write(record.date);
            stream.write(',');
            stream.write(record.time);
            stream.write(',');
            stream.write(record.memory);
            stream.write(',');
            stream.write(record.status);
            stream.write('\n');
            // stream.end();
        })
    })
};