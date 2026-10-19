export const TERMINAL = ['completed', 'partial', 'failed', 'cancelled']

export const STAGES = [
  ['queued', 'Queued'],
  ['generating', 'Independent answers'],
  ['reviewing', 'Cross-review'],
  ['evaluating', 'Trust policy'],
  ['synthesizing', 'Synthesis'],
  ['checking', 'Final check'],
]

// Baseline trust policy v1 dimensions (weights shown for transparency only;
// the backend computes scores).
export const DIMENSIONS = [
  ['relevance', 'Relevance', 30],
  ['completeness', 'Completeness', 25],
  ['clarity', 'Clarity', 20],
  ['evidenceHandling', 'Evidence handling', 25],
]

export const MAX_PROMPT = 4000

export const SCORE_DISCLAIMER =
  'Scores are heuristic reviewer ratings, not correctness probabilities. Agreement between models is not proof that an answer is true.'
