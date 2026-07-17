
export async function generateStudyMaterials({ notes, topic, signal }) {
  const url = "https://study-assistant-api-tkyg.onrender.com/api/generate";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  if (signal) {
    signal.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      controller.abort();
    });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes, topic }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Failed to generate study materials.';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.details || errorMessage;
      } catch {
        errorMessage = `Server returned status ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data || typeof data !== 'object') {
      throw new Error('Received invalid data shape from server.');
    }

    const standardizedTitle = String(data.title || topic || 'Study Set').trim();

    const rawFlashcards = Array.isArray(data.flashcards) ? data.flashcards : [];
    const cleanedFlashcards = rawFlashcards
      .filter(card => card && typeof card === 'object')
      .map(card => ({
        front: String(card.front || card.question || 'Missing question/term').trim(),
        back: String(card.back || card.answer || 'Missing answer/definition').trim()
      }))
      .filter(card => card.front.length > 0 || card.back.length > 0);

    const rawQuiz = Array.isArray(data.quiz) ? data.quiz : [];
    const cleanedQuiz = rawQuiz
      .filter(q => q && typeof q === 'object' && q.question)
      .map(q => {
        const rawOptions = Array.isArray(q.options) ? q.options : [];
        const options = rawOptions
          .map(opt => String(opt || '').trim())
          .filter(opt => opt.length > 0);
        
        if (options.length === 0) {
          options.push('True', 'False');
        }

        let correctIdx = parseInt(q.correctAnswerIndex ?? q.correctIndex ?? q.answerIndex, 10);
        if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= options.length) {
          correctIdx = 0; 
        }

        return {
          question: String(q.question).trim(),
          options,
          correctAnswerIndex: correctIdx,
          explanation: String(q.explanation || 'No explanation provided.').trim()
        };
      });

    if (cleanedFlashcards.length === 0 && cleanedQuiz.length === 0) {
      throw new Error('AI response was empty. Please check your notes/topic input and try again.');
    }

    return {
      title: standardizedTitle,
      flashcards: cleanedFlashcards,
      quiz: cleanedQuiz
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new DOMException('Request aborted to prioritize a newer query.', 'AbortError');
    }
    console.error('API client invocation failed:', error);
    throw error;
  }
}
