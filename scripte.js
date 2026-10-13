class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedListStack {
    constructor() {
        this.top = null;
        this.size = 0;
    }

    push(value) {
        const node = new Node(value);
        node.next = this.top;
        this.top = node;
        this.size++;
    }

    pop() {
        if (!this.top) {
            throw new Error("Stack underflow!");
        }

        const value = this.top.value;
        this.top = this.top.next;
        this.size--;
        return value;
    }

    peek() {
        return this.top ? this.top.value : null;
    }

    isEmpty() {
        return this.top === null;
    }

    toArray() {
        const values = [];
        let current = this.top;

        while (current) {
            values.push(current.value);
            current = current.next;
        }

        return values;
    }
}

let stack = new LinkedListStack();
let steps = [];
let currentStep = -1;

const expressionInput = document.getElementById("expression");
const stackContainer = document.getElementById("stack");
const output = document.getElementById("result");
const status = document.getElementById("status");
const trace = document.getElementById("trace");

function getExpression() {
    return expressionInput?.value.trim() || "8 3 - 2 4 * + 6 /";
}

function createSteps(expression) {
    const tokens = expression.split(/\s+/);
    const s = new LinkedListStack();
    const history = [];

    for (const token of tokens) {
        const operators = ["+", "-", "*", "/"];

        if (operators.includes(token)) {
            if (s.size < 2) {
                throw new Error("Invalid expression: not enough operands.");
            }

            const b = s.pop();
            const a = s.pop();
            let value;

            switch (token) {
                case "+": value = a + b; break;
                case "-": value = a - b; break;
                case "*": value = a * b; break;
                case "/":
                    if (b === 0) throw new Error("Division by zero.");
                    value = a / b;
                    break;
            }

            s.push(value);
            history.push({
                token,
                message: `${a} ${token} ${b} = ${value}`,
                stack: s.toArray()
            });
        } else {
            const number = Number(token);

            if (token === "" || !Number.isFinite(number)) {
                throw new Error(`Invalid token: ${token}`);
            }

            s.push(number);
            history.push({
                token,
                message: `Push ${number} onto the stack`,
                stack: s.toArray()
            });
        }
    }

    if (s.size !== 1) {
        throw new Error("Invalid expression: check the number of operators.");
    }

    return history;
}

function renderStep() {
    if (currentStep < 0 || !steps.length) return;

    const step = steps[currentStep];

    if (stackContainer) {
        stackContainer.innerHTML = "";

        step.stack.forEach((value, index) => {
            const node = document.createElement("div");
            node.className = "stack-node";
            node.textContent = Number(value.toFixed(6)).toString();
            node.style.margin = "8px";
            stackContainer.appendChild(node);

            if (index < step.stack.length - 1) {
                const arrow = document.createElement("div");
                arrow.textContent = "↓";
                arrow.className = "stack-arrow";
                stackContainer.appendChild(arrow);
            }
        });
    }

    if (status) {
        status.textContent = `Step ${currentStep + 1} of ${steps.length}`;
    }

    if (trace) {
        trace.textContent = step.message;
    }

    if (output) {
        output.textContent =
            currentStep === steps.length - 1
                ? `Result: ${step.stack[0]}`
                : "Processing...";
    }

    const nextButton = document.getElementById("nextBtn");
    const prevButton = document.getElementById("prevBtn");

    if (nextButton) nextButton.disabled = currentStep >= steps.length - 1;
    if (prevButton) prevButton.disabled = currentStep <= 0;
}

function evaluatePostfix() {
    try {
        steps = createSteps(getExpression());
        currentStep = 0;
        renderStep();
    } catch (error) {
        if (output) output.textContent = error.message;
        if (status) status.textContent = "Evaluation failed";
    }
}

function nextStep() {
    if (currentStep < steps.length - 1) {
        currentStep++;
        renderStep();
    }
}

function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        renderStep();
    }
}

function resetLab() {
    steps = [];
    currentStep = -1;

    if (stackContainer) stackContainer.innerHTML = "";
    if (output) output.textContent = "Waiting for evaluation...";
    if (status) status.textContent = "Ready";
    if (trace) trace.textContent = "Enter an expression and click Evaluate.";

    const nextButton = document.getElementById("nextBtn");
    const prevButton = document.getElementById("prevBtn");

    if (nextButton) nextButton.disabled = true;
    if (prevButton) prevButton.disabled = true;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("evaluateBtn")
        ?.addEventListener("click", evaluatePostfix);

    document.getElementById("nextBtn")
        ?.addEventListener("click", nextStep);

    document.getElementById("prevBtn")
        ?.addEventListener("click", previousStep);

    document.getElementById("resetBtn")
        ?.addEventListener("click", resetLab);

    resetLab();
});
