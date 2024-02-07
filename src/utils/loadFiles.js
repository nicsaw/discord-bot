const fs = require('fs');
const path = require('path');

module.exports = (directory, callback) => {
  const files = fs.readdirSync(directory).filter(file => file.endsWith('.js'));
  for (const file of files) {
    const filePath = path.join(directory, file);
    const entity = require(filePath);
    callback(entity, filePath);
  }
}
