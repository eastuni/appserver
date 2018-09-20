/**
 * @author Choi Junhyeok
 * @version $$id: formula-editor.js, v 0.1 2017-07-04 $$
 */

TokenType = {
  ARITHMETIC: 1,
  DISCOUNT: 2,
  CONDITION: 3,
  FUNCTION: 4,
  OPEN_BRACKET: 5,
  CLOSE_BRACKET: 6,
  NUMBER: 7,
  COMMA: 8,
  CALCULATION_RULE: 9
};

State = {
  EXPECT_VALUE: 0,
  EXPECT_OPERATOR: 1,
  EXPECT_OPEN_BRACKET: 2
};

const FormulaEditor = {
    patterns: [
      {regex: /^[\+\-\*/]/, type: TokenType.ARITHMETIC},
      {regex: /^#[0-9]+/, type: TokenType.DISCOUNT},
      {regex: /^[\$#][YLADFNRIKCP]([0-9]{4})/, type: TokenType.CONDITION},
      {regex: /^min|max|avg|sum|priority|multiply|and|or|not|match[0-9]|case/i, type: TokenType.FUNCTION},
      {regex: /^\(/, type: TokenType.OPEN_BRACKET},
      {regex: /^\)/, type: TokenType.CLOSE_BRACKET},
      {regex: /^[0-9]+/, type: TokenType.NUMBER},
      {regex: /^,/, type: TokenType.COMMA},
      {regex: /^#RULE([0-9]{11})/, type: TokenType.CALCULATION_RULE}
    ],
    
    validate: function(rule, scope) {
      var tokens = this.tokenize(rule);

      if (!tokens)
        return false;
        
      //return this.validateAll(tokens, scope);
      return this.validateParenthesis(tokens) && this.validateSyntax(tokens)
          && this.validateScope(tokens, scope);
    },
    
    validateParenthesis: function(tokens) {
      var stack = 0;
      for (var i in tokens) {
        token = tokens[i];
        switch (token.type) {
          case TokenType.OPEN_BRACKET:
            stack++;
            break;

          case TokenType.CLOSE_BRACKET:
            stack--;
            break;

          default:
            continue;
        }

        if (stack < 0)
          return false;
      }
      
      return stack === 0;
    },

    validateSyntax: function(tokens) {
        var state = State.EXPECT_VALUE;

        for (var i in tokens) {
          token = tokens[i];
          
          switch (token.type) {
          case TokenType.ARITHMETIC:
            if (state !== State.EXPECT_OPERATOR) return false;
            state = State.EXPECT_VALUE;
            break;

          case TokenType.CONDITION:
          case TokenType.NUMBER:
            if (state !== State.EXPECT_VALUE) return false;
            state = State.EXPECT_OPERATOR;
            break;

          case TokenType.OPEN_BRACKET:
            if (state === State.EXPECT_OPEN_BRACKET)
              state = State.EXPECT_VALUE;
            if (state !== State.EXPECT_VALUE) return false;
            break;

          case TokenType.CLOSE_BRACKET:
            if (state !== State.EXPECT_OPERATOR) return false;
            break;
          
          case TokenType.FUNCTION:
            if (state !== State.EXPECT_VALUE) return false;
            state = State.EXPECT_OPEN_BRACKET;
            break;
            
          case TokenType.COMMA:
            if (state !== State.EXPECT_OPERATOR) return false;
            state = State.EXPECT_VALUE;
            break;

          default:
            return false;
          }
        }
        
        return state === State.EXPECT_OPERATOR
    },
    
    /**
     * scope: {
     *   func: [ a, b, c ],
     *   condition: [ d, e, f ]
     * }
     */
    validateScope: function(tokens, scope) {
      if (scope) {
        // build map
        var validFunction = {};
        var validCondition = {};
        
        if (scope.func) {
          for (var i in scope.func) {
            validFunction[scope.func[i]] = true;
          }
        }
        
        if (scope.condition) {
          for (var i in scope.condition) {
            validCondition[scope.condition[i]] = true;
          }
        }
        
        for (var i in tokens) {
          token = tokens[i];

          switch (token.type) {
          case TokenType.FUNCTION:
            if (!validFunction[token.value]) return false;
            break;

          case TokenType.CONDITION:
            if (!validCondition[token.value]) return false;
            break;
          }
        }
      }

      return true;
    },
    
    /**
     * Integrated Validation
     */
    validateAll: function(tokens, scope) {
      var state = State.EXPECT_VALUE;
      var stack = 0;
      var validFunction = {};
      var validCondition = {};
      
      if (scope) {
        if (scope.func) {
          for (var i in scope.func) {
            validFunction[scope.func[i]] = true;
          }
        }
        
        if (scope.condition) {
          for (var i in scope.condition) {
            validCondition[scope.condition[i]] = true;
          }
        }
      }

      for (var i in tokens) {
        token = tokens[i];

        switch (token.type) {
        case TokenType.ARITHMETIC:
          if (state !== State.EXPECT_OPERATOR) return false;
          state = State.EXPECT_VALUE;
          break;

        case TokenType.CONDITION:
          if (scope && scope.condition && !validCondition[token.value]) return false;
        case TokenType.NUMBER:
          if (state !== State.EXPECT_VALUE) return false;
          state = State.EXPECT_OPERATOR;
          break;

        case TokenType.OPEN_BRACKET:
          if (state !== State.EXPECT_VALUE) return false;
          stack++;
          break;

        case TokenType.CLOSE_BRACKET:
          if (state !== State.EXPECT_OPERATOR) return false;
          stack--;
          break;
          
        case TokenType.FUNCTION:
          if (scope && scope.func && !validFunction[token.value]) return false;
          break;

        default:
          return false;
        }

        if (stack < 0)
          return false;
      }

      return state === State.EXPECT_OPERATOR && stack === 0;
    },

    tokenize: function(str) {
      var tokens = [];
      var match = false;
      str = str.replace(/\s/g, "");
      
      while (str) {
        token = null;

        for (var i in this.patterns) {
          pattern = this.patterns[i];
          match = str.match(pattern.regex)
          if (match) {
            token = {
              type: pattern.type,
              value: match[0]
            };
            str = str.replace(token.value, "");
            break;
          }
        }
        
        if (token)
          tokens.push(token);
        else
          return null;
      }
      
      return tokens;
    },
    
    toContent: function(tokens, delimiter) {
      var result = "";
      var value;
      if (!delimiter) delimiter = "";

      $.each(tokens, function(index, token) {
        if (token.type === TokenType.ARITHMETIC)
          result += delimiter;

        result += token.value;

        if (token.type === TokenType.ARITHMETIC || token.type === TokenType.COMMA)
          result += delimiter;
      });

      return result;
    },
    
    translate: function(rule, map, delimiter) {
      var tokens = this.tokenize(rule) || [];
      var result = "";
      map = map || {};
      delimiter = delimiter || "";

      $.each(tokens, function(index, token) {
        if (token.type === TokenType.ARITHMETIC)
          result += delimiter;
        
        switch (token.type) {
        case TokenType.CONDITION:
        case TokenType.DISCOUNT:
          result += map[token.value.substr(1)] || token.value;
          break;
        default:
          result += token.value;
        }

        if (token.type === TokenType.ARITHMETIC || token.type === TokenType.COMMA)
          result += delimiter;
      });

      return result
    }

};