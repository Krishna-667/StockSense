const { stringify } = require('csv-stringify');
const { parse } = require('csv-parse');

const stringifyToCsv = (records, columns) => {
  return new Promise((resolve, reject) => {
    stringify(records, { header: true, columns }, (err, output) => {
      if (err) reject(err);
      else resolve(output);
    });
  });
};

const parseCsvBuffer = (buffer) => {
  return new Promise((resolve, reject) => {
    parse(
      buffer,
      {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      },
      (err, records) => {
        if (err) reject(err);
        else resolve(records);
      }
    );
  });
};

module.exports = {
  stringifyToCsv,
  parseCsvBuffer,
};
