const fs = require('fs');
const deletFile = (filePath) => {
  //to delete filename and file
  fs.unlink(filePath, (err) => {
    if (err) throw err;
  });
};

exports.deletFile = deletFile;
