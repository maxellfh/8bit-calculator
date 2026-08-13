import { useState } from "react";
import { twMerge } from "tailwind-merge";

function CalculatorButton({ children, className, ...rest }) {
  return (
    <button
      className={twMerge(
        "bg-[#2e2d3b] py-4 aspect-square rounded-2xl shadow-sm text-white hover:brightness-90 active:brightness-85 transition-all hover:cursor-pointer duration-250",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

function calculateExpression(expression) {
  const tokens = expression.match(/(\d*\.?\d+|[+\-x÷])/g);

  if (!tokens) return 0;

  const values = [];
  const operators = [];

  const precedence = {
    "+": 1,
    "-": 1,
    x: 2,
    "÷": 2,
  };

  function applyOperator() {
    const operator = operators.pop();
    const right = values.pop();
    const left = values.pop();

    switch (operator) {
      case "+":
        values.push(left + right);
        break;
      case "-":
        values.push(left - right);
        break;
      case "x":
        values.push(left * right);
        break;
      case "÷":
        values.push(left / right);
        break;
      default:
        break;
    }
  }

  for (const token of tokens) {
    if (!isNaN(token)) {
      values.push(parseFloat(token));
    } else {
      while (
        operators.length > 0 &&
        precedence[operators[operators.length - 1]] >= precedence[token]
      ) {
        applyOperator();
      }

      operators.push(token);
    }
  }

  while (operators.length > 0) {
    applyOperator();
  }

  return values[0];
}

function Calculator() {
  const [expression, setExpression] = useState("");
  const [justCalculated, setJustCalculated] = useState(false);

  function handleNumberClick(number) {
    if (expression === "Error" || justCalculated) {
      setExpression(number);
      setJustCalculated(false);
      return;
    }

    setExpression((prev) => prev + number);
  }

  function handleOperatorClick(operator) {
    if (expression === "Error") {
      setExpression("");
      return;
    }

    setJustCalculated(false);

    setExpression((prev) => {
      if (!prev) {
        return operator === "-" ? "-" : "";
      }

      if (/[+\-x÷]$/.test(prev)) {
        return prev.slice(0, -1) + operator;
      }

      return prev + operator;
    });
  }

  function handleDecimalClick() {
    if (expression === "Error" || justCalculated) {
      setExpression("0.");
      setJustCalculated(false);
      return;
    }

    setExpression((prev) => {
      const currentNumber = prev.split(/[+\-x÷]/).pop();

      if (currentNumber.includes(".")) {
        return prev;
      }

      if (!currentNumber) {
        return prev + "0.";
      }

      return prev + ".";
    });
  }

  function handleClear() {
    setExpression("");
    setJustCalculated(false);
  }

  function handlePercent() {
    if (!expression || expression === "Error") return;

    setExpression((prev) => {
      const match = prev.match(/(\d*\.?\d+)$/);

      if (!match) return prev;

      const number = parseFloat(match[0]);
      const result = number / 100;

      return prev.slice(0, -match[0].length) + result;
    });

    setJustCalculated(false);
  }

  function handleSqrt() {
    if (!expression || expression === "Error") return;

    setExpression((prev) => {
      const match = prev.match(/(\d*\.?\d+)$/);

      if (!match) return prev;

      const number = parseFloat(match[0]);

      if (number < 0) {
        return "Error";
      }

      const result = Math.sqrt(number);

      return prev.slice(0, -match[0].length) + result;
    });

    setJustCalculated(false);
  }

  function handleEqual() {
    if (!expression || expression === "Error") return;

    if (/[+\-x÷]$/.test(expression)) {
      return;
    }

    try {
      const result = calculateExpression(expression);

      if (!Number.isFinite(result)) {
        setExpression("Error");
        setJustCalculated(true);
        return;
      }

      let formattedResult;

      if (
        Math.abs(result) >= 1e10 ||
        (Math.abs(result) > 0 && Math.abs(result) < 1e-6)
      ) {
        formattedResult = result.toExponential(3);
      } else {
        formattedResult = Number.isInteger(result)
          ? String(result)
          : String(Number(result.toFixed(3)));
      }

      setExpression(formattedResult);
      setJustCalculated(true);
    } catch {
      setExpression("Error");
      setJustCalculated(true);
    }
  }

  function handleDisplay() {
    if (!expression) {
      return "0";
    }

    if (expression === "Error") {
      return "Error";
    }

    return expression.replace(/\d*\.?\d+/g, (number) => {
      const [integer, decimal] = number.split(".");

      const formattedInteger = Number(integer).toLocaleString();

      if (decimal !== undefined) {
        return `${formattedInteger}.${decimal.slice(0, 3)}`;
      }

      return formattedInteger;
    });
  }

  return (
    <div className="w-80 max-w-[calc(100vw-2rem)] bg-[#26262e] p-5 rounded-2xl border-3 border-blue-400 shadow-md">
      <div className="w-full h-17 bg-[#1b1b23] text-right p-3 mb-5 text-3xl rounded-xl shadow-sm text-white overflow-x-auto overflow-y-hidden whitespace-nowrap flex items-center justify-end">
        <span className="min-w-max">{handleDisplay()}</span>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {/* Top row */}
        <CalculatorButton
          className="bg-red-500 text-white"
          onClick={handleClear}
        >
          C
        </CalculatorButton>

        <CalculatorButton onClick={handlePercent}>%</CalculatorButton>

        <CalculatorButton onClick={handleSqrt}>√</CalculatorButton>

        <CalculatorButton
          className="bg-blue-400 text-white"
          onClick={() => handleOperatorClick("÷")}
        >
          ÷
        </CalculatorButton>

        {/* 1 2 3 x */}
        <CalculatorButton onClick={() => handleNumberClick("1")}>
          1
        </CalculatorButton>

        <CalculatorButton onClick={() => handleNumberClick("2")}>
          2
        </CalculatorButton>

        <CalculatorButton onClick={() => handleNumberClick("3")}>
          3
        </CalculatorButton>

        <CalculatorButton
          className="bg-blue-400 text-white"
          onClick={() => handleOperatorClick("x")}
        >
          x
        </CalculatorButton>

        {/* 4 5 6 - */}
        <CalculatorButton onClick={() => handleNumberClick("4")}>
          4
        </CalculatorButton>

        <CalculatorButton onClick={() => handleNumberClick("5")}>
          5
        </CalculatorButton>

        <CalculatorButton onClick={() => handleNumberClick("6")}>
          6
        </CalculatorButton>

        <CalculatorButton
          className="bg-blue-400 text-white"
          onClick={() => handleOperatorClick("-")}
        >
          -
        </CalculatorButton>

        {/* 7 8 9 + */}
        <CalculatorButton onClick={() => handleNumberClick("7")}>
          7
        </CalculatorButton>

        <CalculatorButton onClick={() => handleNumberClick("8")}>
          8
        </CalculatorButton>

        <CalculatorButton onClick={() => handleNumberClick("9")}>
          9
        </CalculatorButton>

        <CalculatorButton
          className="bg-blue-400 text-white"
          onClick={() => handleOperatorClick("+")}
        >
          +
        </CalculatorButton>

        {/* 0 . = */}
        <CalculatorButton
          onClick={() => handleNumberClick("0")}
          className="col-span-2 aspect-auto"
        >
          0
        </CalculatorButton>

        <CalculatorButton onClick={handleDecimalClick}>.</CalculatorButton>

        <CalculatorButton
          className="bg-green-500 text-white"
          onClick={handleEqual}
        >
          =
        </CalculatorButton>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="bg-[#161622] h-dvh w-full flex items-center justify-center relative overflow-clip">
      <div className="w-full flex flex-col items-center">
        <div className="w-80 max-w-[calc(100vw-2rem)] mb-6 shadow-md">
          <div className="bg-[#26262e] border-2 border-blue-400 rounded-xl px-4 py-3 text-xs text-gray-400 leading-relaxed font-medium">
            <span className="text-blue-400">*</span> Results are rounded to 3
            decimals. Large numbers may use scientific notation.
          </div>
        </div>
        <Calculator />

        <div className="w-90 max-w-[calc(100vw-2rem)] mt-5 text-lg text-gray-400 text-center font-medium shadow-sm">
          Made with <span className="text-red-400 text-xl">❤ </span>by{" "}
          <a
            href="https://github.com/MaxellFH"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:brightness-90 transition-all"
          >
            Maxell.
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
