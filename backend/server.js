import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize GenAI
// app.get("/", (req, res) => {
//   res.json({
//     status: "Study Assistant API is running 🚀"
//   });
// });
const apiKey = process.env.GEMINI_API_KEY;
const isMockMode = !apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key_here');

if (isMockMode) {
  console.warn("==================================================================");
  console.warn("⚠️  WARNING: GEMINI_API_KEY is not set in backend/.env!");
  console.warn("🤖 Running in DEVELOPER MOCK MODE (Simulating AI responses).");
  console.warn("==================================================================");
}

const ai = !isMockMode ? new GoogleGenAI({ apiKey }) : null;

// Mock data generator for offline/no-key usage
const getMockData = (topic, notes) => {
  const query = (topic || notes || '').toLowerCase();
  
  if (query.includes('javascript') || query.includes('async') || query.includes('promise')) {
    return {
      title: "JavaScript Async/Await (Demo Mock)",
      flashcards: [
        { front: "What is a Promise in JavaScript?", back: "An object representing the eventual completion or failure of an asynchronous operation." },
        { front: "What does 'async' keyword do?", back: "It is placed before a function to make it return a Promise, allowing the use of await inside." },
        { front: "What does 'await' keyword do?", back: "It pauses code execution until a Promise resolves or rejects, making async code look synchronous." },
        { front: "How do you handle errors in async/await?", back: "By wrapping the await statements in a try/catch block." },
        { front: "What is the event loop?", back: "The mechanism that allows JS to perform non-blocking I/O operations by offloading tasks to the system kernel." }
      ],
      quiz: [
        {
          question: "Which keyword is used to wait for a Promise to resolve?",
          options: ["wait", "await", "defer", "promise.resolve"],
          correctAnswerIndex: 1,
          explanation: "The 'await' keyword is used inside async functions to pause execution until a Promise is resolved."
        },
        {
          question: "What does an async function always return?",
          options: ["A Promise", "Undefined", "Null", "A callback"],
          correctAnswerIndex: 0,
          explanation: "Any function marked with 'async' automatically wraps its return value in a Promise."
        },
        {
          question: "How do you catch errors in async/await code blocks?",
          options: ["Using .catch() only", "Using a try...catch statement", "Using a throw statement", "It is done automatically"],
          correctAnswerIndex: 1,
          explanation: "Wrapping asynchronous code in try/catch lets you handle thrown errors synchronously."
        },
        {
          question: "Which of the following is true about Promises?",
          options: ["They are always synchronous", "They have 3 states: pending, fulfilled, rejected", "They cannot be chained", "They block the main execution thread"],
          correctAnswerIndex: 1,
          explanation: "Promises are asynchronous and exist in one of three states: pending (initial), fulfilled (success), or rejected (failure)."
        },
        {
          question: "What is the purpose of Promise.all()?",
          options: ["To run promises sequentially", "To reject all promises", "To run multiple promises in parallel and wait for all of them to complete", "To delete promises"],
          correctAnswerIndex: 2,
          explanation: "Promise.all() accepts an array of promises and resolves when all of them resolve, or rejects if any reject."
        }
      ]
    };
  }
  
  if (query.includes('photosynthesis')) {
    return {
      title: "Photosynthesis Process (Demo Mock)",
      flashcards: [
        { front: "What is photosynthesis?", back: "The process by which plants, algae, and some bacteria convert light energy into chemical energy (glucose)." },
        { front: "Where does photosynthesis occur in plant cells?", back: "In the chloroplasts, which contain chlorophyll to absorb light." },
        { front: "What are the light-dependent reactions?", back: "Reactions that occur in the thylakoid membranes to convert light energy into ATP and NADPH, releasing oxygen." },
        { front: "What is the Calvin Cycle?", back: "Light-independent reactions occurring in the stroma that use ATP, NADPH, and carbon dioxide to produce glucose." },
        { front: "What is chlorophyll?", back: "The green pigment in chloroplasts that absorbs light energy (primarily blue and red wavelengths)." }
      ],
      quiz: [
        {
          question: "What are the primary reactants of photosynthesis?",
          options: ["Oxygen and Glucose", "Carbon Dioxide, Water, and Light", "Nitrogen and Carbon Dioxide", "ATP and Oxygen"],
          correctAnswerIndex: 1,
          explanation: "Plants take in Carbon Dioxide (CO2), Water (H2O), and sunlight to synthesize sugar and release oxygen."
        },
        {
          question: "Which gas is released as a byproduct of light reactions?",
          options: ["Carbon Dioxide", "Nitrogen", "Oxygen", "Water Vapor"],
          correctAnswerIndex: 2,
          explanation: "Water molecules are split during light-dependent reactions, releasing oxygen gas (O2) into the atmosphere."
        },
        {
          question: "Where do the light-independent (Calvin Cycle) reactions take place?",
          options: ["Thylakoid membrane", "Stroma", "Mitochondria", "Cell wall"],
          correctAnswerIndex: 1,
          explanation: "The Calvin Cycle occurs in the stroma, the fluid-filled space surrounding the thylakoids in chloroplasts."
        },
        {
          question: "What energy-carrier molecules are produced in the light reactions and used in the Calvin Cycle?",
          options: ["Glucose and Oxygen", "ATP and NADPH", "DNA and RNA", "ADP and NADP+"],
          correctAnswerIndex: 1,
          explanation: "ATP and NADPH store chemical energy from the light reactions and power the synthesis of sugar in the Calvin Cycle."
        },
        {
          question: "What pigment absorbs sunlight to power photosynthesis?",
          options: ["Carotenoid", "Chlorophyll", "Hemoglobin", "Melanin"],
          correctAnswerIndex: 1,
          explanation: "Chlorophyll is the main pigment responsible for capturing light energy to drive photosynthesis."
        }
      ]
    };
  }

  // Default fallback mock
  const displayTopic = (topic || "Custom Study Topic").trim();
  return {
    title: `${displayTopic} (Simulated Demo)`,
    flashcards: [
      { front: `What is the core definition of ${displayTopic}?`, back: `It refers to the key theories, practical applications, and terminologies associated with the subject of ${displayTopic}.` },
      { front: `What is a primary concept of ${displayTopic}?`, back: `A foundational rule or model that explains how elements within ${displayTopic} relate to one another.` },
      { front: `Why is studying ${displayTopic} important?`, back: `It provides critical insights to solve problems, analyze data, and build practical systems in this field.` },
      { front: `What is a common misconception about ${displayTopic}?`, back: `That it is highly complex; in reality, breaking it down into modular rules reveals standard logical systems.` },
      { front: `How do you apply ${displayTopic} in the real world?`, back: `By analyzing constraints, applying standard guidelines, and testing outputs to achieve reliable results.` }
    ],
    quiz: [
      {
        question: `Which of the following best defines the primary purpose of ${displayTopic}?`,
        options: ["To analyze and build systematic solutions", "To ignore core principles", "To automate without checking constraints", "To replace manual logic completely"],
        correctAnswerIndex: 0,
        explanation: `Systematic problem-solving is the primary objective of studying and working with ${displayTopic}.`
      },
      {
        question: `What is the most critical starting step when learning ${displayTopic}?`,
        options: ["Memorizing complex edge cases", "Understanding foundational vocabulary and definitions", "Writing code without reading rules", "Skipping error boundaries"],
        correctAnswerIndex: 1,
        explanation: "Getting familiar with baseline definitions and principles establishes a robust learning path."
      },
      {
        question: `In the context of ${displayTopic}, what is the role of continuous verification?`,
        options: ["It slows down performance", "It ensures outputs match requirements and detects anomalies early", "It is completely optional and discouraged", "It is only done in production"],
        correctAnswerIndex: 1,
        explanation: "Testing and validation ensure correctness and prevent logic errors from propagating."
      },
      {
        question: `What is the best way to handle failures in ${displayTopic} workflows?`,
        options: ["Crash the app immediately", "Ignore the errors", "Implement safe error boundaries and recovery options", "Delete the code"],
        correctAnswerIndex: 2,
        explanation: "Robust systems catch failures gracefully and offer users recovery paths, ensuring no crashes."
      },
      {
        question: `Which approach yields the highest quality outcomes in ${displayTopic}?`,
        options: ["Ad-hoc styling and guesses", "Consistent testing, clean structures, and validation loops", "Hurried execution", "Using unverified schemas"],
        correctAnswerIndex: 1,
        explanation: "Quality comes from structured development, automated schema validation, and clean state management."
      }
    ]
  };
};

app.post('/api/generate', async (req, res) => {
  const { notes, topic } = req.body;
  if (!notes && !topic) {
    return res.status(400).json({ error: 'Please provide either notes or a topic.' });
  }

  // Developer Mock Mode Fallback
  if (isMockMode) {
    console.log(`[MOCK MODE] Simulating study materials for: "${topic || 'Notes'}"`);
    // Add artificial delay for realistic UX loading states
    await new Promise(resolve => setTimeout(resolve, 1200));
    return res.json(getMockData(topic, notes));
  }

  const inputContent = notes ? `Notes: ${notes}` : `Topic: ${topic}`;

  const prompt = `
Generate a comprehensive study set including both flashcards and a multiple-choice quiz based on the following content.
Create at least 5 flashcards that are clear, bite-sized, and effective for learning core definitions or concepts.
Create a quiz with exactly 5 multiple choice questions. Each question must have 4 distinct options, with only one correct answer. Provide a helpful, constructive explanation for the correct answer.

Content to analyze:
${inputContent}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'models/gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            title: { type: 'STRING' },
            flashcards: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  front: { type: 'STRING' },
                  back: { type: 'STRING' }
                },
                required: ['front', 'back']
              }
            },
            quiz: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  question: { type: 'STRING' },
                  options: {
                    type: 'ARRAY',
                    items: { type: 'STRING' }
                  },
                  correctAnswerIndex: { type: 'INTEGER' },
                  explanation: { type: 'STRING' }
                },
                required: ['question', 'options', 'correctAnswerIndex', 'explanation']
              }
            }
          },
          required: ['title', 'flashcards', 'quiz']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Empty response received from the Gemini API.');
    }

    const parsedData = JSON.parse(responseText);
    return res.json(parsedData);
  } catch (error) {
    console.error('Error generating content:', error);
    return res.status(500).json({
      error: 'Failed to generate study materials.',
      details: error.message || error
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
