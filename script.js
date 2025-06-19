const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080; // 🔥 Ready for cloud deploy

app.use(express.static(__dirname)); // serve index.html

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).send('❌ No file uploaded!');

  const inputPath = req.file.path;
  const outputFile = `cleaned_${Date.now()}.mp4`;
  const outputPath = path.join('outputs', outputFile);

  // Ensure outputs dir exists
  if (!fs.existsSync('outputs')) fs.mkdirSync('outputs');

  const cmd = `ffmpeg -i "${inputPath}" -map 0 -map_metadata -1 -c copy "${outputPath}"`;

  exec(cmd, (err, stdout, stderr) => {
    fs.unlinkSync(inputPath); // remove uploaded file

    if (err) {
      console.error(stderr);
      return res.status(500).send('⚠️ Video processing failed!');
    }

    res.download(outputPath, 'cleaned_video.mp4', (err) => {
      if (err) console.error(err);
      fs.unlinkSync(outputPath); // clean output after download
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server ready on PORT ${PORT}`);
});