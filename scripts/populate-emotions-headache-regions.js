#!/usr/bin/env node

/**
 * Populate Emotions and Headache Regions Collections
 * Creates initial data for emotions and headache regions that users can select from
 * 
 * Usage: node scripts/populate-emotions-headache-regions.js
 */

// Initialize Firebase directly
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  Timestamp 
} = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRJHNyiW8NMqa1DEmEsOouA7lIfFwd9XM",
  authDomain: "headachemd.firebaseapp.com",
  projectId: "headachemd",
  storageBucket: "headachemd.appspot.com",
  messagingSenderId: "109987892469",
  appId: "1:109987892469:web:48875d9a9d65383ff289bc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample emotions data
const emotionsData = [
  // Positive emotions
  { name: 'Hopeful', description: 'Feeling optimistic about the future', category: 'positive', intensity: 4, isActive: true },
  { name: 'Calm', description: 'Feeling peaceful and relaxed', category: 'positive', intensity: 3, isActive: true },
  { name: 'Determined', description: 'Feeling motivated and focused', category: 'positive', intensity: 4, isActive: true },
  { name: 'Grateful', description: 'Feeling thankful and appreciative', category: 'positive', intensity: 3, isActive: true },
  { name: 'Confident', description: 'Feeling self-assured and capable', category: 'positive', intensity: 4, isActive: true },
  { name: 'Peaceful', description: 'Feeling serene and tranquil', category: 'positive', intensity: 3, isActive: true },
  { name: 'Optimistic', description: 'Feeling positive about outcomes', category: 'positive', intensity: 4, isActive: true },
  { name: 'Content', description: 'Feeling satisfied and fulfilled', category: 'positive', intensity: 3, isActive: true },
  
  // Negative emotions
  { name: 'Frustrated', description: 'Feeling annoyed and impatient', category: 'negative', intensity: 4, isActive: true },
  { name: 'Anxious', description: 'Feeling worried and nervous', category: 'negative', intensity: 4, isActive: true },
  { name: 'Irritable', description: 'Feeling easily annoyed and short-tempered', category: 'negative', intensity: 3, isActive: true },
  { name: 'Depressed', description: 'Feeling sad and hopeless', category: 'negative', intensity: 5, isActive: true },
  { name: 'Overwhelmed', description: 'Feeling unable to cope with demands', category: 'negative', intensity: 4, isActive: true },
  { name: 'Angry', description: 'Feeling strong displeasure and hostility', category: 'negative', intensity: 4, isActive: true },
  { name: 'Worried', description: 'Feeling concerned and troubled', category: 'negative', intensity: 3, isActive: true },
  { name: 'Stressed', description: 'Feeling mental or emotional strain', category: 'negative', intensity: 4, isActive: true },
  { name: 'Lonely', description: 'Feeling isolated and disconnected', category: 'negative', intensity: 3, isActive: true },
  { name: 'Helpless', description: 'Feeling unable to help oneself', category: 'negative', intensity: 4, isActive: true },
  
  // Neutral emotions
  { name: 'Neutral', description: 'Feeling neither positive nor negative', category: 'neutral', intensity: 2, isActive: true },
  { name: 'Tired', description: 'Feeling weary and in need of rest', category: 'neutral', intensity: 3, isActive: true },
  { name: 'Focused', description: 'Feeling concentrated and attentive', category: 'neutral', intensity: 3, isActive: true },
  { name: 'Curious', description: 'Feeling interested and eager to learn', category: 'neutral', intensity: 3, isActive: true },
  { name: 'Reflective', description: 'Feeling thoughtful and contemplative', category: 'neutral', intensity: 2, isActive: true },
  { name: 'Alert', description: 'Feeling awake and aware', category: 'neutral', intensity: 3, isActive: true },
  { name: 'Restless', description: 'Feeling unable to rest or relax', category: 'neutral', intensity: 3, isActive: true },
  { name: 'Indifferent', description: 'Feeling uninterested and apathetic', category: 'neutral', intensity: 2, isActive: true }
];

// Sample headache regions data
const headacheRegionsData = [
  // Primary headache regions
  { name: 'Frontal', description: 'Forehead area', category: 'primary', severity: 3, isActive: true },
  { name: 'Temporal', description: 'Side of head, near temples', category: 'primary', severity: 3, isActive: true },
  { name: 'Occipital', description: 'Back of head, base of skull', category: 'primary', severity: 3, isActive: true },
  { name: 'Parietal', description: 'Top of head', category: 'primary', severity: 3, isActive: true },
  { name: 'Vertex', description: 'Crown of the head', category: 'primary', severity: 3, isActive: true },
  { name: 'Bilateral', description: 'Both sides of the head', category: 'primary', severity: 4, isActive: true },
  { name: 'Unilateral', description: 'One side of the head', category: 'primary', severity: 4, isActive: true },
  { name: 'Hemicranial', description: 'Half of the head', category: 'primary', severity: 4, isActive: true },
  
  // Secondary headache regions
  { name: 'Periorbital', description: 'Around the eyes', category: 'secondary', severity: 3, isActive: true },
  { name: 'Retro-orbital', description: 'Behind the eyes', category: 'secondary', severity: 4, isActive: true },
  { name: 'Maxillary', description: 'Upper jaw area', category: 'secondary', severity: 3, isActive: true },
  { name: 'Mandibular', description: 'Lower jaw area', category: 'secondary', severity: 3, isActive: true },
  { name: 'Cervical', description: 'Neck area', category: 'secondary', severity: 3, isActive: true },
  { name: 'Suboccipital', description: 'Below the occipital bone', category: 'secondary', severity: 3, isActive: true },
  { name: 'Supraorbital', description: 'Above the eyes', category: 'secondary', severity: 3, isActive: true },
  { name: 'Infraorbital', description: 'Below the eyes', category: 'secondary', severity: 3, isActive: true },
  
  // Referred pain regions
  { name: 'Referred to Eye', description: 'Pain referred to the eye area', category: 'referred', severity: 4, isActive: true },
  { name: 'Referred to Jaw', description: 'Pain referred to the jaw area', category: 'referred', severity: 3, isActive: true },
  { name: 'Referred to Neck', description: 'Pain referred to the neck area', category: 'referred', severity: 3, isActive: true },
  { name: 'Referred to Shoulder', description: 'Pain referred to the shoulder area', category: 'referred', severity: 3, isActive: true },
  { name: 'Referred to Arm', description: 'Pain referred to the arm area', category: 'referred', severity: 3, isActive: true },
  { name: 'Referred to Face', description: 'Pain referred to the facial area', category: 'referred', severity: 3, isActive: true },
  { name: 'Referred to Ear', description: 'Pain referred to the ear area', category: 'referred', severity: 3, isActive: true },
  { name: 'Referred to Teeth', description: 'Pain referred to the teeth area', category: 'referred', severity: 3, isActive: true }
];

async function populateEmotions() {
  console.log('🔄 Populating emotions collection...');
  
  try {
    // Check if emotions already exist
    const existingEmotions = await getDocs(collection(db, 'emotions'));
    if (!existingEmotions.empty) {
      console.log(`⚠️  Emotions collection already has ${existingEmotions.size} documents. Skipping...`);
      return;
    }
    
    // Add emotions with timestamps
    for (const emotion of emotionsData) {
      await addDoc(collection(db, 'emotions'), {
        ...emotion,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    
    console.log(`✅ Successfully added ${emotionsData.length} emotions to the database`);
  } catch (error) {
    console.error('❌ Error populating emotions:', error);
  }
}

async function populateHeadacheRegions() {
  console.log('🔄 Populating headache_regions collection...');
  
  try {
    // Check if headache regions already exist
    const existingRegions = await getDocs(collection(db, 'headache_regions'));
    if (!existingRegions.empty) {
      console.log(`⚠️  Headache regions collection already has ${existingRegions.size} documents. Skipping...`);
      return;
    }
    
    // Add headache regions with timestamps
    for (const region of headacheRegionsData) {
      await addDoc(collection(db, 'headache_regions'), {
        ...region,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    }
    
    console.log(`✅ Successfully added ${headacheRegionsData.length} headache regions to the database`);
  } catch (error) {
    console.error('❌ Error populating headache regions:', error);
  }
}

async function main() {
  console.log('🚀 Starting emotions and headache regions population...');
  console.log('📊 This will create initial data for user selection in the app');
  console.log('');
  
  await populateEmotions();
  console.log('');
  await populateHeadacheRegions();
  
  console.log('');
  console.log('🎉 Population complete!');
  console.log('📱 Users can now select from these emotions and headache regions in the app');
  console.log('👨‍⚕️ Doctors can manage these options through the admin interface');
  
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
