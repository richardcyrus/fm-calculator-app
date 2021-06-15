(function (window) {
  "use strict";

  let firstNumber = "";
  let secondNumber = "";
  let operator = "";
  let result = 0;
  let isOperatorChosen = false;
  let isCalculated = false;

  const calculator = {
    firstOperand: 0,
    secondOperand: 0,
    resetButton: document.querySelector("#button-reset"),
    deleteButton: document.querySelector("#button-delete"),
    operatorButtons: document.querySelectorAll(".operator"),
    numberButtons: document.querySelectorAll(".number"),
    equalButton: document.querySelector("#button-equals"),
    calculatorDisplay: document.querySelector(".calculator__screen"),

    /**
     * Add event handlers and initialize the calculator.
     */
    init: function () {
      this.resetButton.addEventListener("click", this.handleReset.bind(this));
      this.deleteButton.addEventListener("click", this.handleDelete.bind(this));
      this.equalButton.addEventListener("click", this.calc.bind(this));

      this.operatorButtons.forEach((button) =>
        button.addEventListener("click", this.handleOperatorInput.bind(this))
      );

      this.numberButtons.forEach((button) =>
        button.addEventListener("click", this.handleNumberInput.bind(this))
      );

      this.handleReset();
    },

    /**
     * Update the appropriate number with the value of the button that was clicked.
     *
     * @param   {Object}  e  The event object.
     */
    handleNumberInput: function (e) {
      let number = e.target.value;

      /**
       * If we've already completed a calculation (without a reset), the
       * user will need to reset before the next calculation.
       */
      if (isCalculated) {
        return false;
      }

      /**
       * Only allow one decimal. We check the displayed number since only
       * one operand is shown at a time.
       */
      if (
        number === "." &&
        this.calculatorDisplay.innerText.indexOf(".") !== -1
      ) {
        return false;
      }

      /**
       * Update the correct stored number based on whether or not an operator
       * has been chosen.
       */
      if (isOperatorChosen) {
        secondNumber += number;
        this.updateDisplay(secondNumber);
      } else {
        firstNumber += number;
        this.updateDisplay(firstNumber);
      }
    },

    /**
     * Store the requested operation and trigger to switch to storing the
     * second number.
     *
     * @param   {Object}  e  The event object.
     */
    handleOperatorInput: function (e) {
      /**
       * Do nothing if the firstNumber is missing or we've completed a
       * calculation.
       */
      if (!firstNumber || isCalculated) {
        return false;
      }

      isOperatorChosen = true;
      operator = e.target.value;
    },

    /**
     * Perform the requested calculation.
     */
    calc: function () {
      // If equal has been clicked, don't calculate again.
      if (isCalculated) {
        return false;
      }

      isCalculated = true;

      this.firstOperand = parseFloat(firstNumber);
      this.secondOperand = parseFloat(secondNumber);

      switch (operator) {
        case "plus":
          result = this.firstOperand + this.secondOperand;
          break;
        case "minus":
          result = this.firstOperand - this.secondOperand;
          break;
        case "times":
          result = this.firstOperand * this.secondOperand;
          break;
        case "divide":
          result = this.firstOperand / this.secondOperand;
          break;
      }

      this.updateDisplay(result, true);
    },

    /**
     * Delete the last digit or decimal of the currently active number.
     */
    handleDelete: function () {
      if (isCalculated) {
        return false;
      }

      if (isOperatorChosen && secondNumber.length > 0) {
        secondNumber = secondNumber.substr(0, secondNumber.length - 1);
        this.updateDisplay(secondNumber);
      } else if (firstNumber.length > 0) {
        firstNumber = firstNumber.substr(0, firstNumber.length - 1);
        this.updateDisplay(firstNumber);
      }
    },

    /**
     * Reset the calculator.
     */
    handleReset: function () {
      firstNumber = "";
      secondNumber = "";
      operator = "";
      result = 0;
      isCalculated = false;
      isOperatorChosen = false;
      this.firstOperand = 0;
      this.secondOperand = 0;
      this.updateDisplay(result);
    },

    /**
     * Update the calculator display.
     *
     * @param   {String|Number}  value   The value to show in the display.
     * @param   {Boolean}  format  Should the final display be formatted?
     */
    updateDisplay: function (value, format = false) {
      if (format) {
        value = new Intl.NumberFormat("en-US", {
          maximumFractionDigits: 20,
        }).format(value);
      }

      if (value.length >= 14) {
        this.calculatorDisplay.style = "overflow-x: scroll";
      } else {
        this.calculatorDisplay.style = "";
      }

      this.calculatorDisplay.textContent = value;
    },
  };

  function themeSwitch() {
    const themes = ["theme-1", "theme-2", "theme-3"];
    const switches = document.querySelectorAll('input[type="radio"]');
    const body = document.querySelector("body");

    if(localStorage.getItem('theme')) {
      const userThemePreference = localStorage.getItem('theme');
      document
        .querySelector(`#${userThemePreference}`)
        .setAttribute("checked", "checked");
        body.classList.remove(...themes);
        body.classList.add(userThemePreference);

    } else {
      // Check prefers-color-scheme for theme.
      const light = window.matchMedia('(prefers-color-scheme: light)').matches;
      const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      if(light) {
        document
        .querySelector("#theme-2")
        .setAttribute("checked", "checked");
        body.classList.remove(...themes);
        body.classList.add("theme-2");
      }

      if(dark) {
        document
        .querySelector("#theme-3")
        .setAttribute("checked", "checked");
        body.classList.remove(...themes);
        body.classList.add("theme-3");
      }

      // If no preference set with `prefers-color-scheme`  or stored in
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
        localStorage.setItem('theme', theme);
      })
    );
  }

  themeSwitch();
  calculator.init();
})(window);
