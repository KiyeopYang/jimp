const express = require("express");
const request = require("request");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const PORT = 80;
const app = express();

const download = function(uri, filename, callback) {
  request.head(uri, function(err, res, body) {
    request(uri)
      .pipe(fs.createWriteStream(filename))
      .on("close", callback);
  });
};
app.get("/", (req, res) => {
  try {
    const { url, resizeX, resizeY } = req.query;

    const FILENAME = path.basename(url);
    const TEMP_FILENAME = `_${FILENAME}`;
    download(url, TEMP_FILENAME, async () => {
      let temp = sharp(TEMP_FILENAME).rotate();
      if (resizeX || resizeY) {
        temp = temp.resize(
          parseInt(resizeX) || null,
          parseInt(resizeY) || null
        );
      }
      // .resize(null, 200)
      temp
        .toFile(FILENAME)
        .then(() => {
          return res.download(FILENAME, FILENAME);
        })
        .then(() => {
          setTimeout(() => {
            fs.unlinkSync(FILENAME);
            fs.unlinkSync(TEMP_FILENAME);
          }, 30000);
        })
        .catch(e => {
          res.status(400).json(e.message);
        });
    });
  } catch (e) {
    console.error(e);
    res.status(400).json(e.message);
  }
});

app.listen(PORT, () => {
  console.log(`Listening to requests on http://localhost:${PORT}`);
});
