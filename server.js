const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Fallback safety for local testing; Render will use the secure dashboard variable
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => {
    console.log('Database connected successfully.');
    seedDatabase();
  })
  .catch(err => console.error('Database connection breakdown:', err));

// ── DATA INTERFACE SCHEMA ──
const projectSchema = new mongoose.Schema({
  title: String,
  type: String,
  desc: String,
  tags: [String]
});

const Project = mongoose.model('Project', projectSchema);

const messageSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// ── AUTOMATED SEED ENGINE ──
// Inside server.js ...

async function seedDatabase() {
  try {
    const count = await Project.countDocuments();
    // If the database is empty, insert the fake data
    if (count === 0) {
      const defaultProjects = [
        // ... Your existing 3 projects are here ...
        
        // Add your new fake data objects below:
        {
          title: "E-Commerce Payment Gateway",
          type: "Full Stack Integration",
          desc: "Implemented a secure, mock payment gateway using Stripe API to process transactional data in real-time.",
          tags: ["Node.js", "Express", "API"]
        },
        {
          title: "Data Visualization Dashboard",
          type: "Frontend Analytics",
          desc: "A responsive dashboard rendering real-time JSON data streams into interactive charts for performance monitoring.",
          tags: ["React", "D3.js", "MongoDB"]
        }
      ];
      await Project.insertMany(defaultProjects);
      console.log('Database seeded with baseline projects.');
    } else {
      console.log('Database already contains data. Skipping seed.');
    }
  } catch (err) {
    console.error('Seeding error:', err);
  }
}


// ── LIVE API ROUTING ──
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find({});
    res.status(200).json(projects);
  } catch (err) {
    res.status(500).json({ error: 'Failed to extract structural project array.' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: 'Missing parameters.' });
    
    const newMsg = new Message({ name, email, message });
    await newMsg.save();
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to register telemetry log.' });
  }
});

app.listen(PORT, () => console.log(`Routing operational on port ${PORT}`));
