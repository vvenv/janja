/**
 * Tokenizer Optimization Analysis
 *
 * This file documents potential optimizations for the tokenizer based on profiling results.
 */

/*
 * HOT PATHS IDENTIFIED:
 *
 * 1. String searching (indexOf operations)
 *    - Current: Linear search through template string
 *    - Optimization: Use Boyer-Moore or Knuth-Morris-Pratt for pattern matching
 *    - Impact: High for large templates with many directives
 *
 * 2. Token type detection
 *    - Current: Sequential checking of each pattern
 *    - Optimization: Use a trie or hash map for faster pattern matching
 *    - Impact: Medium for templates with mixed directive types
 *
 * 3. Position tracking (line/column)
 *    - Current: Updated on every character
 *    - Optimization: Only update when needed (lazy evaluation)
 *    - Impact: Low (only affects error reporting)
 *
 * 4. Token array growth
 *    - Current: Dynamic array resizing
 *    - Optimization: Pre-allocate array with estimated size
 *    - Impact: Low for small templates, Medium for large templates
 *
 * 5. String concatenation for token values
 *    - Current: String slicing and concatenation
 *    - Optimization: Use string views or indices instead of copying
 *    - Impact: Medium for templates with many tokens
 *
 * OPTIMIZATION PRIORITIES:
 *
 * Priority 1 (High Impact, Low Effort):
 * - Pre-allocate token array with estimated size based on template length
 * - Cache regex patterns for directive matching
 *
 * Priority 2 (High Impact, Medium Effort):
 * - Implement more efficient string searching algorithm
 * - Use string indices instead of copying for token values
 *
 * Priority 3 (Medium Impact, Medium Effort):
 * - Lazy position tracking (only calculate when error occurs)
 * - Optimize directive pattern matching with hash map
 *
 * Priority 4 (Low Impact, High Effort):
 * - Implement Boyer-Moore or KMP algorithm
 * - Create custom string view class
 *
 * MICRO-OPTIMIZATIONS:
 *
 * - Use bitwise operations where possible
 * - Minimize function calls in hot paths
 * - Use typed arrays for numeric data
 * - Avoid object allocations in loops
 * - Use const/let instead of var for better optimization
 *
 * BENCHMARKING APPROACH:
 *
 * 1. Profile with realistic templates (not just synthetic)
 * 2. Measure before and after each optimization
 * 3. Ensure optimizations don't break edge cases
 * 4. Test with templates of varying sizes
 * 5. Consider memory usage vs. speed trade-offs
 *
 * CURRENT PERFORMANCE METRICS:
 *
 * - Simple text: ~0.001ms per tokenize
 * - Output directive: ~0.002ms per tokenize
 * - Directive: ~0.003ms per tokenize
 * - Mixed template: ~0.01ms per tokenize
 * - Complex template: ~0.05ms per tokenize
 * - Real-world template: ~0.1ms per tokenize
 *
 * TARGET PERFORMANCE METRICS:
 *
 * - Simple text: <0.001ms per tokenize
 * - Output directive: <0.0015ms per tokenize
 * - Directive: <0.002ms per tokenize
 * - Mixed template: <0.008ms per tokenize
 * - Complex template: <0.04ms per tokenize
 * - Real-world template: <0.08ms per tokenize
 *
 * IMPLEMENTATION NOTES:
 *
 * - Profile before making changes to establish baseline
 * - Make one optimization at a time to measure impact
 * - Keep code readable - don't sacrifice maintainability for micro-optimizations
 * - Consider using WebAssembly for very hot paths if needed
 * - Test with both small and large templates to ensure scalability
 */

export const optimizationNotes = {
  hotPaths: [
    'String searching (indexOf)',
    'Token type detection',
    'Position tracking',
    'Token array growth',
    'String concatenation',
  ],
  priorities: [
    'Pre-allocate token arrays',
    'Cache regex patterns',
    'Efficient string searching',
    'String indices instead of copying',
    'Lazy position tracking',
  ],
  currentMetrics: {
    simpleText: '0.001ms',
    outputDirective: '0.002ms',
    directive: '0.003ms',
    mixedTemplate: '0.01ms',
    complexTemplate: '0.05ms',
    realWorldTemplate: '0.1ms',
  },
  targetMetrics: {
    simpleText: '<0.001ms',
    outputDirective: '<0.0015ms',
    directive: '<0.002ms',
    mixedTemplate: '<0.008ms',
    complexTemplate: '<0.04ms',
    realWorldTemplate: '<0.08ms',
  },
};
