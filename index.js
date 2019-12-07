const express = require("express");
const request = require("request");
const path = require("path");
const fs = require("fs");
const jimp = require("jimp");

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
    const { url, quality, scale, resizeX, resizeY } = req.query;
    const FILENAME = path.basename(decodeURIComponent(url));
    const TEMP_FILENAME = `_${FILENAME}`;
    download(url, TEMP_FILENAME, async () => {
      // let temp = sharp(TEMP_FILENAME).rotate();
      let temp = jimp.read(TEMP_FILENAME).then(async temp => {
        if (resizeX || resizeY) {
          temp = temp.resize(
            resizeX ? parseInt(resizeX) : jimp.AUTO,
            resizeY ? parseInt(resizeY) : jimp.AUTO
          );
        }
        if (quality) {
          temp = temp.quality(Number(quality));
        }
        if (scale) {
          temp = temp.scale(Number(scale));
        }
        // .resize(null, 200)
        temp.write(FILENAME, result => {
          res.download(FILENAME, FILENAME);
        });
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
