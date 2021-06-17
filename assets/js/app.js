(function (window) {
  "use strict";

  // @see: https://freshman.tech/calculator/
  // @see: https://codereview.stackexchange.com/questions/204859/js-calculator-respecting-order-of-operations

  function operateOnEntry(expression) {
    let indexOfOperand;

    Object.keys(calculatorOperations).forEach(function (functionName) {
      while (expression.includes(functionName)) {
        indexOfOperand = expression.indexOf(functionName);
        expression = calculationSequence(
          functionName,
          indexOfOperand,
          expression
        );
      }
    });

    return expression;
  }

  const returnIndexOfEntry = (index, expression) => {
    const arg1 = Number(expression[index - 1]);
    const arg2 = Number(expression[index + 1]);

    return [arg1, arg2];
  };

  const returnSpliced = (index, newTotal, expression) => {
    expression.splice(index - 1, 3, newTotal);

    return expression;
  };

  const calculationSequence = (operation, indexOfOperand, expression) => {
    const getArgs = returnIndexOfEntry(indexOfOperand, expression);
    const newTotalForEntry = calculatorOperations[operation](
      getArgs[0],
      getArgs[1]
    );
    const newExpression = returnSpliced(
      indexOfOperand,
      newTotalForEntry,
      expression
    );

    return newExpression;
  };

  const calculatorOperations = {
    "x": (arg1, arg2) => arg1 * arg2,
    "/": (arg1, arg2) => arg1 / arg2,
    "+": (arg1, arg2) => arg1 + arg2,
    "-": (arg1, arg2) => arg1 - arg2,
  };

  /**
   * Calculator
   *
   * Used to handle the interaction with the calculator buttons and the
   * display.
   *
   * @var {string} displayValue Holds a string value that represents the input
   *                            of the user or the result of an operation.
   * @var {Number} firstOperand Stores the current operand for any expression.
   * @var {Boolean} waitingForOperand A way to check if the currentOperand and
   *                            an operator have been provided.
   * @var {String} operator Store the last chosen operator.
   * @var {Array} expression Store the expression entered by the user.
   */
  const calculator = {
    displayValue: "0",
    firstOperand: null,
    waitingForOperand: false,
    operator: null,
    expression: [],

    /**
     * Initialize the calculator.
     *
     * Register the event handler for key presses and set the initial display.
     */
    init: function () {
      const keys = document.querySelector(".calculator__keypad");
      keys.addEventListener("click", (event) => {
        const { target } = event;
        const { value } = target;

        if (!target.matches("button")) {
          return;
        }

        switch (value) {
          case "+":
          case "-":
          case "x":
          case "/":
            this.handleOperator(value);
            break;
          case "equals":
            this.calculate();
            break;
          case ".":
            this.inputDecimal(value);
            break;
          case "delete":
            this.handleDelete();
            break;
          case "reset":
            this.resetCalculator();
            break;
          default:
            if (Number.isInteger(parseFloat(value))) {
              this.inputDigit(value);
            }
        }

        this.updateDisplay();
        // console.log(this);
      });

      this.resetCalculator();
      this.updateDisplay();
    },

    /**
     * Reset state when the 'reset' button is clicked, or when starting the app.
     */
    resetCalculator: function () {
      this.displayValue = "0";
      this.firstOperand = null;
      this.waitingForOperand = false;
      this.operator = null;
      this.expression = [];
    },

    /**
     * Update the display anytime an operation is performed.
     */
    updateDisplay: function () {
      const display = document.querySelector(".calculator__screen");
      const displayValue = parseFloat(this.displayValue);

      if (!Number.isFinite(displayValue)) {
        display.textContent = "Overflow";
        this.firstOperand = null;
        return;
      }

      display.textContent = this.displayValue;
    },

    /**
     * Handle the input of digits.
     *
     * @param   {Number}  digit  The digit that was clicked on the keypad
     */
    inputDigit: function (digit) {
      const { displayValue, waitingForOperand } = this;

      if (waitingForOperand === true) {
        this.displayValue = digit;
        this.waitingForOperand = false;
      } else {
        this.displayValue = displayValue === "0" ? digit : displayValue + digit;
      }
    },

    /**
     * Manage the input of a decimal in a number.
     *
     * Ensure that only one decimal is allowed per operand.
     *
     * @param   {String}  dot  The decimal input.
     */
    inputDecimal: function (dot) {
      if (this.waitingForOperand === true) {
        this.displayValue = "0.";
        this.waitingForOperand = false;
        return;
      }

      if (!this.displayValue.includes(dot)) {
        this.displayValue += dot;
      }
    },

    /**
     * Handle the input of operators.
     *
     * Does not handle the '=' operator.
     *
     * @param   {String}  nextOperator  The string representation of the operator.
     */
    handleOperator: function (nextOperator) {
      const { firstOperand, displayValue, operator } = this;
      const inputValue = parseFloat(displayValue);

      // If two operators are chosen in sequence, use the last one that
      // was chosen.
      if (operator && this.waitingForOperand) {
        this.operator = nextOperator;
        this.expression.pop();
        this.expression.push(nextOperator);
        return;
      }

      // The first time an operator is chosen.
      if (firstOperand == null && !isNaN(inputValue)) {
        this.firstOperand = inputValue;
        this.expression.push(inputValue);
      } else if (operator) {
        // All subsequent inputs of an operator.
        this.expression.push(inputValue);

        this.displayValue = String(inputValue);
        this.firstOperand = inputValue;
      }

      this.waitingForOperand = true;
      this.operator = nextOperator;
      this.expression.push(nextOperator);
    },

    /**
     * Remove the last digit that was input when the 'Del' button is clicked.
     */
    handleDelete: function () {
      const { displayValue } = this;

      this.displayValue =
        displayValue.substr(0, displayValue.length - 1) > 0
          ? displayValue.substr(0, displayValue.length - 1)
          : "0";

      this.updateDisplay();
    },

    /**
     * Execute the calculation when the '=' button is clicked.
     */
    calculate: function () {
      const { displayValue, expression } = this;

      // Update the expression with the currently displayed input
      const inputValue = parseFloat(displayValue);
      expression.push(inputValue);

      // Execute the calculation.
      const result = operateOnEntry(expression);

      // Update the number to display.
      this.displayValue = `${parseFloat(result[0].toFixed(7))}`;

      // Store the result so a new expression can be built using it as the
      // first value.
      this.firstOperand = result[0];

      /*
       * Clear the stored expression. The firstOperand will be pushed onto
       * the expression when the next operator is chosen.
       */
      this.expression = [];
    },
  };

  /**
   * Handle the theme switcher controls.
   */
  function themeSwitch() {
    const themes = ["theme-1", "theme-2", "theme-3"];
    const switches = document.querySelectorAll('input[type="radio"]');
    const body = document.querySelector("body");

    // If a theme preference is stored, choose it as the default.
    if (localStorage.getItem("theme")) {
      const userThemePreference = localStorage.getItem("theme");
      document
        .querySelector(`#${userThemePreference}`)
        .setAttribute("checked", "checked");
      body.classList.remove(...themes);
      body.classList.add(userThemePreference);
    } else {
      /* If no theme preference is stored, then use prefers-color-scheme
         to select a default theme.
       */
      // Check prefers-color-scheme for theme.
      const light = window.matchMedia("(prefers-color-scheme: light)").matches;
      const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      if (light) {
        document.querySelector("#theme-2").setAttribute("checked", "checked");
        body.classList.remove(...themes);
        body.classList.add("theme-2");
      }

      if (dark) {
        document.querySelector("#theme-3").setAttribute("checked", "checked");
        body.classList.remove(...themes);
        body.classList.add("theme-3");
      }

      // If no preference set with `prefers-color-scheme` or stored in
      // localStorage then use the default in the body tag. This sets
      // the theme selector position to match.
      const currentTheme = body.classList;
      document
        .querySelector(`#${currentTheme}`)
        .setAttribute("checked", "checked");
    }

    // Change the theme when the user uses the theme switcher.
    switches.forEach((item) =>
      item.addEventListener("click", function (e) {
        const theme = e.target.value;

        item.setAttribute("checked", "checked");

        body.classList.remove(...themes);
        body.classList.add(theme);

        /* Since the user has made a specific selection, store that selection
           for use the next time the user visits the page.
        */
        localStorage.setItem("theme", theme);
      })
    );
  }

  themeSwitch();
  calculator.init();
})(window);
