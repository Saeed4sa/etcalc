import { AngleUnit, NotationFormat } from '../types/calculator';

// Factorial with memoization
export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    // Lanczos gamma approximation for non-integers or negative
    return gamma(n + 1);
  }
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

// Lanczos approximation for Gamma(z)
function gamma(z: number): number {
  const g = 7;
  const C = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) {
    return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  }
  z -= 1;
  let x = C[0];
  for (let i = 1; i < g + 2; i++) {
    x += C[i] / (z + i);
  }
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
}

export function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  r = Math.min(r, n - r);
  let c = 1;
  for (let i = 1; i <= r; i++) {
    c = (c * (n - (r - i))) / i;
  }
  return Math.round(c);
}

export function nPr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  let p = 1;
  for (let i = 0; i < r; i++) {
    p *= n - i;
  }
  return Math.round(p);
}

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

export function lcm(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return Math.abs(Math.round(a * b)) / gcd(a, b);
}

// Convert angle input to Radians based on selected angle unit
export function toRadians(val: number, unit: AngleUnit): number {
  switch (unit) {
    case 'DEG':
      return (val * Math.PI) / 180;
    case 'GRAD':
      return (val * Math.PI) / 200;
    case 'RAD':
    default:
      return val;
  }
}

// Convert Radians to output unit based on selected angle unit
export function fromRadians(rad: number, unit: AngleUnit): number {
  switch (unit) {
    case 'DEG':
      return (rad * 180) / Math.PI;
    case 'GRAD':
      return (rad * 200) / Math.PI;
    case 'RAD':
    default:
      return rad;
  }
}

/**
 * Format number to scientific, engineering, normal, or fixed
 */
export function formatResult(num: number, format: NotationFormat = 'norm', fixPrecision: number = 4): string {
  if (isNaN(num)) return 'Error: Indeterminate';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';

  // Small floating point cleanup (e.g. 0.00000000000000006 -> 0, 0.49999999999999994 -> 0.5)
  if (Math.abs(num) < 1e-14 && Math.abs(num) > 0) return '0';
  const precisionClean = Math.round(num * 1e12) / 1e12;
  if (Math.abs(precisionClean - Math.round(precisionClean)) < 1e-11) {
    num = Math.round(precisionClean);
  }

  switch (format) {
    case 'sci': {
      return num.toExponential(fixPrecision);
    }
    case 'eng': {
      if (num === 0) return '0.0000 × 10⁰';
      const exp = Math.floor(Math.log10(Math.abs(num)));
      const engExp = Math.floor(exp / 3) * 3;
      const mantissa = num / Math.pow(10, engExp);
      return `${mantissa.toFixed(fixPrecision)} × 10^${engExp}`;
    }
    case 'fix': {
      return num.toFixed(fixPrecision);
    }
    case 'norm':
    default: {
      if (Math.abs(num) >= 1e14 || (Math.abs(num) > 0 && Math.abs(num) < 1e-7)) {
        return num.toPrecision(10).replace(/0+$/, '').replace(/\.$/, '');
      }
      // Format with reasonable decimal places
      const str = String(num);
      if (str.includes('.')) {
        const parts = str.split('.');
        if (parts[1].length > 10) {
          return parseFloat(num.toFixed(10)).toString();
        }
      }
      return str;
    }
  }
}

/**
 * Convert decimal to fraction (e.g. 0.75 -> 3/4)
 */
export function decimalToFraction(val: number): string | null {
  if (isNaN(val) || !isFinite(val)) return null;
  if (Number.isInteger(val)) return `${val}/1`;

  const sign = val < 0 ? -1 : 1;
  val = Math.abs(val);

  const tolerance = 1.0e-9;
  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = val;

  do {
    const a = Math.floor(b);
    let aux = h1;
    h1 = a * h1 + h2;
    h2 = aux;

    aux = k1;
    k1 = a * k1 + k2;
    k2 = aux;

    b = 1 / (b - a);
  } while (Math.abs(val - h1 / k1) > val * tolerance && k1 < 1000000);

  if (k1 === 1) return `${sign * h1}`;
  if (k1 > 1000000) return null; // Couldn't find a clean fraction
  return `${sign * h1}/${k1}`;
}

/**
 * Token types for math parser
 */
type TokenType = 'NUMBER' | 'OP' | 'FUNC' | 'LPAREN' | 'RPAREN' | 'COMMA' | 'VAR';

interface Token {
  type: TokenType;
  value: string;
}

/**
 * Tokenize input mathematical string
 */
export function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const clean = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\s+/g, '');

  const funcList = [
    'asin', 'acos', 'atan', 'asinh', 'acosh', 'atanh',
    'sinh', 'cosh', 'tanh',
    'sin', 'cos', 'tan',
    'ln', 'log10', 'log2', 'log',
    'sqrt', 'cbrt',
    'abs', 'floor', 'ceil', 'round', 'sign',
    'ncr', 'npr', 'gcd', 'lcm', 'exp'
  ];

  while (i < clean.length) {
    const char = clean[i];

    // Numbers (including decimals and scientific e.g. 1.2e-4)
    if (/[0-9]/.test(char) || (char === '.' && /[0-9]/.test(clean[i + 1] || ''))) {
      let numStr = '';
      while (i < clean.length && (/[0-9.]/.test(clean[i]))) {
        numStr += clean[i];
        i++;
      }
      // Check for scientific notation exponent 'e' followed by + or - and digits
      if (i < clean.length && (clean[i] === 'e' || clean[i] === 'E')) {
        const next = clean[i + 1];
        if (/[0-9]/.test(next) || ((next === '+' || next === '-') && /[0-9]/.test(clean[i + 2] || ''))) {
          numStr += clean[i];
          i++;
          if (clean[i] === '+' || clean[i] === '-') {
            numStr += clean[i];
            i++;
          }
          while (i < clean.length && /[0-9]/.test(clean[i])) {
            numStr += clean[i];
            i++;
          }
        }
      }
      tokens.push({ type: 'NUMBER', value: numStr });
      continue;
    }

    // Mathematical Constants and Variables
    if (char === 'π' || clean.substring(i, i + 2).toLowerCase() === 'pi') {
      tokens.push({ type: 'VAR', value: 'pi' });
      i += (char === 'π' ? 1 : 2);
      continue;
    }
    if (char === 'e' && !/[a-zA-Z0-9]/.test(clean[i + 1] || '') && (tokens.length === 0 || tokens[tokens.length - 1].type !== 'NUMBER')) {
      tokens.push({ type: 'VAR', value: 'e' });
      i++;
      continue;
    }
    if (char === 'φ' || clean.substring(i, i + 3).toLowerCase() === 'phi') {
      tokens.push({ type: 'VAR', value: 'phi' });
      i += (char === 'φ' ? 1 : 3);
      continue;
    }

    // Variable 'x' for function evaluation / graphing
    if (char === 'x' && !/[a-zA-Z]/.test(clean[i + 1] || '')) {
      tokens.push({ type: 'VAR', value: 'x' });
      i++;
      continue;
    }

    // Check for functions
    let matchedFunc = '';
    const sub = clean.slice(i).toLowerCase();
    for (const f of funcList) {
      if (sub.startsWith(f)) {
        matchedFunc = f;
        break;
      }
    }

    if (matchedFunc) {
      tokens.push({ type: 'FUNC', value: matchedFunc });
      i += matchedFunc.length;
      continue;
    }

    // Parentheses
    if (char === '(') {
      tokens.push({ type: 'LPAREN', value: '(' });
      i++;
      continue;
    }
    if (char === ')') {
      tokens.push({ type: 'RPAREN', value: ')' });
      i++;
      continue;
    }
    if (char === ',') {
      tokens.push({ type: 'COMMA', value: ',' });
      i++;
      continue;
    }

    // Operators
    if (['+', '-', '*', '/', '^', '%', '!'].includes(char)) {
      tokens.push({ type: 'OP', value: char });
      i++;
      continue;
    }

    // Unrecognized character
    i++;
  }

  // Insert implicit multiplication: e.g. 2(3) -> 2*(3), 2pi -> 2*pi, (2)(3) -> (2)*(3), 3x -> 3*x, 5sin(x) -> 5*sin(x)
  const expanded: Token[] = [];
  for (let k = 0; k < tokens.length; k++) {
    const cur = tokens[k];
    const next = tokens[k + 1];
    expanded.push(cur);

    if (next) {
      const isCurVal = cur.type === 'NUMBER' || cur.type === 'VAR' || cur.type === 'RPAREN' || (cur.type === 'OP' && cur.value === '!');
      const isNextVal = next.type === 'NUMBER' || next.type === 'VAR' || next.type === 'LPAREN' || next.type === 'FUNC';

      if (isCurVal && isNextVal) {
        expanded.push({ type: 'OP', value: '*' });
      }
    }
  }

  return expanded;
}

/**
 * Shunting Yard algorithm: converts infix tokens to Reverse Polish Notation (RPN)
 */
const PRECEDENCE: Record<string, { prec: number; assoc: 'L' | 'R'; unary?: boolean }> = {
  '+': { prec: 2, assoc: 'L' },
  '-': { prec: 2, assoc: 'L' },
  '*': { prec: 3, assoc: 'L' },
  '/': { prec: 3, assoc: 'L' },
  '%': { prec: 3, assoc: 'L' },
  'u-': { prec: 4, assoc: 'R', unary: true },
  '^': { prec: 5, assoc: 'R' },
  '!': { prec: 6, assoc: 'L', unary: true }, // Postfix unary
};

export function toRPN(tokens: Token[]): Token[] {
  const output: Token[] = [];
  const opStack: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'NUMBER' || token.type === 'VAR') {
      output.push(token);
    } else if (token.type === 'FUNC') {
      opStack.push(token);
    } else if (token.type === 'COMMA') {
      while (opStack.length && opStack[opStack.length - 1].type !== 'LPAREN') {
        output.push(opStack.pop()!);
      }
    } else if (token.type === 'OP') {
      // Check for unary minus: if at beginning or preceded by operator or LPAREN
      let opKey = token.value;
      if (token.value === '-') {
        const prev = tokens[i - 1];
        if (!prev || prev.type === 'OP' || prev.type === 'LPAREN' || prev.type === 'COMMA') {
          opKey = 'u-';
        }
      }

      const curOp = PRECEDENCE[opKey] || { prec: 0, assoc: 'L' };

      // Handle factorial postfix immediately
      if (token.value === '!') {
        output.push({ type: 'OP', value: '!' });
        continue;
      }

      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.type === 'LPAREN') break;

        const topOpKey = top.value;
        const topOp = PRECEDENCE[topOpKey] || { prec: 0, assoc: 'L' };

        if (
          top.type === 'FUNC' ||
          (curOp.assoc === 'L' && curOp.prec <= topOp.prec) ||
          (curOp.assoc === 'R' && curOp.prec < topOp.prec)
        ) {
          output.push(opStack.pop()!);
        } else {
          break;
        }
      }
      opStack.push({ type: 'OP', value: opKey });
    } else if (token.type === 'LPAREN') {
      opStack.push(token);
    } else if (token.type === 'RPAREN') {
      while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'LPAREN') {
        output.push(opStack.pop()!);
      }
      if (opStack.length > 0 && opStack[opStack.length - 1].type === 'LPAREN') {
        opStack.pop(); // discard LPAREN
      }
      if (opStack.length > 0 && opStack[opStack.length - 1].type === 'FUNC') {
        output.push(opStack.pop()!);
      }
    }
  }

  while (opStack.length > 0) {
    output.push(opStack.pop()!);
  }

  return output;
}

/**
 * Evaluate RPN tokens
 */
export function evaluateRPN(rpn: Token[], angleUnit: AngleUnit = 'RAD', varValues: Record<string, number> = {}): number {
  const stack: number[] = [];

  for (const token of rpn) {
    if (token.type === 'NUMBER') {
      stack.push(parseFloat(token.value));
    } else if (token.type === 'VAR') {
      if (token.value === 'pi') stack.push(Math.PI);
      else if (token.value === 'e') stack.push(Math.E);
      else if (token.value === 'phi') stack.push((1 + Math.sqrt(5)) / 2);
      else if (token.value in varValues) stack.push(varValues[token.value]);
      else stack.push(0);
    } else if (token.type === 'OP') {
      if (token.value === 'u-') {
        const a = stack.pop() ?? 0;
        stack.push(-a);
      } else if (token.value === '!') {
        const a = stack.pop() ?? 0;
        stack.push(factorial(a));
      } else {
        const b = stack.pop() ?? 0;
        const a = stack.pop() ?? 0;

        switch (token.value) {
          case '+': stack.push(a + b); break;
          case '-': stack.push(a - b); break;
          case '*': stack.push(a * b); break;
          case '/':
            if (b === 0) throw new Error('Division by zero');
            stack.push(a / b);
            break;
          case '^': stack.push(Math.pow(a, b)); break;
          case '%': stack.push(a % b); break;
          default:
            throw new Error(`Unknown operator ${token.value}`);
        }
      }
    } else if (token.type === 'FUNC') {
      const f = token.value.toLowerCase();
      // Binary functions
      if (f === 'ncr' || f === 'npr' || f === 'gcd' || f === 'lcm') {
        const b = stack.pop() ?? 0;
        const a = stack.pop() ?? 0;
        if (f === 'ncr') stack.push(nCr(a, b));
        else if (f === 'npr') stack.push(nPr(a, b));
        else if (f === 'gcd') stack.push(gcd(a, b));
        else if (f === 'lcm') stack.push(lcm(a, b));
        continue;
      }

      // Unary functions
      const arg = stack.pop() ?? 0;

      switch (f) {
        case 'sin': {
          const rad = toRadians(arg, angleUnit);
          stack.push(Math.sin(rad));
          break;
        }
        case 'cos': {
          const rad = toRadians(arg, angleUnit);
          stack.push(Math.cos(rad));
          break;
        }
        case 'tan': {
          const rad = toRadians(arg, angleUnit);
          // Check for vertical asymptotes: pi/2, 3pi/2, etc.
          const cosVal = Math.cos(rad);
          if (Math.abs(cosVal) < 1e-15) throw new Error('Undefined (tan asymptote)');
          stack.push(Math.tan(rad));
          break;
        }
        case 'asin': {
          if (arg < -1 || arg > 1) throw new Error('Domain Error [-1, 1]');
          const rad = Math.asin(arg);
          stack.push(fromRadians(rad, angleUnit));
          break;
        }
        case 'acos': {
          if (arg < -1 || arg > 1) throw new Error('Domain Error [-1, 1]');
          const rad = Math.acos(arg);
          stack.push(fromRadians(rad, angleUnit));
          break;
        }
        case 'atan': {
          const rad = Math.atan(arg);
          stack.push(fromRadians(rad, angleUnit));
          break;
        }
        case 'sinh': stack.push(Math.sinh(arg)); break;
        case 'cosh': stack.push(Math.cosh(arg)); break;
        case 'tanh': stack.push(Math.tanh(arg)); break;
        case 'asinh': stack.push(Math.asinh(arg)); break;
        case 'acosh': {
          if (arg < 1) throw new Error('Domain Error [1, ∞)');
          stack.push(Math.acosh(arg));
          break;
        }
        case 'atanh': {
          if (arg <= -1 || arg >= 1) throw new Error('Domain Error (-1, 1)');
          stack.push(Math.atanh(arg));
          break;
        }
        case 'ln': {
          if (arg <= 0) throw new Error('Domain Error (x > 0)');
          stack.push(Math.log(arg));
          break;
        }
        case 'log':
        case 'log10': {
          if (arg <= 0) throw new Error('Domain Error (x > 0)');
          stack.push(Math.log10(arg));
          break;
        }
        case 'log2': {
          if (arg <= 0) throw new Error('Domain Error (x > 0)');
          stack.push(Math.log2(arg));
          break;
        }
        case 'sqrt': {
          if (arg < 0) throw new Error('Negative Square Root');
          stack.push(Math.sqrt(arg));
          break;
        }
        case 'cbrt': stack.push(Math.cbrt(arg)); break;
        case 'exp': stack.push(Math.exp(arg)); break;
        case 'abs': stack.push(Math.abs(arg)); break;
        case 'floor': stack.push(Math.floor(arg)); break;
        case 'ceil': stack.push(Math.ceil(arg)); break;
        case 'round': stack.push(Math.round(arg)); break;
        case 'sign': stack.push(Math.sign(arg)); break;
        default:
          throw new Error(`Unknown function: ${f}`);
      }
    }
  }

  if (stack.length === 0) return 0;
  return stack[stack.length - 1];
}

/**
 * Public evaluation helper
 */
export function evaluateExpression(expr: string, angleUnit: AngleUnit = 'RAD', varValues: Record<string, number> = {}): number {
  if (!expr.trim()) return 0;
  const tokens = tokenize(expr);
  if (tokens.length === 0) return 0;
  const rpn = toRPN(tokens);
  return evaluateRPN(rpn, angleUnit, varValues);
}

/**
 * Real-time expression syntax check & preview
 */
export function previewExpression(expr: string, angleUnit: AngleUnit = 'RAD'): { result?: number; error?: string } {
  if (!expr.trim()) return {};
  try {
    const val = evaluateExpression(expr, angleUnit);
    if (isNaN(val)) return { error: 'NaN' };
    return { result: val };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Invalid Expression' };
  }
}

/**
 * Numerical derivative at point x
 */
export function numericalDerivative(expr: string, x: number, angleUnit: AngleUnit = 'RAD', h: number = 1e-6): number {
  const f_plus = evaluateExpression(expr, angleUnit, { x: x + h });
  const f_minus = evaluateExpression(expr, angleUnit, { x: x - h });
  return (f_plus - f_minus) / (2 * h);
}
