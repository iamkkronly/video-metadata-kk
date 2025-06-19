const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname)); // serve index.html

// Configure Multer
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded!');
  }

  const inputPath = req.file.path;
  const outputPath = path.join('outputs', `cleaned_${Date.now()}.mp4`);

  // Ensure outputs dir exists
  if (!fs.existsSync('outputs')) {
    fs.mkdirSync('outputs');
  }

  // Run ffmpeg to remove metadata
  const cmd = `ffmpeg -i ${inputPath} -map 0 -map_metadata -1 -c copy ${outputPath}`;
  exec(cmd, (error, stdout, stderr) => {
    fs.unlinkSync(inputPath); // clean up uploaded file

    if (error) {
      console.error(`Error: ${stderr}`);
      return res.status(500).send('Failed to process video');
    }

    // Send file for download
    res.download(outputPath, 'cleaned_video.mp4', (err) => {
      if (err) console.error(err);
      fs.unlinkSync(outputPath); // clean up output file after send
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
