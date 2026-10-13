
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

class Stack {
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
        if (!this.top) throw Error("Insufficient operands");
        const value = this.top.data;
        this.top = this.top.next;
        this.size--;
        return value;
    }

    values() {
        const result = [];
        let current = this.top;

        while (current) {
            result.push(current.data);
            current = current.next;
        }

        return result;
    }
}

let steps = [];
let position = -1;
let tokens = [];
let failed = false;

const $ = id => document.getElementById(id);

function fmt(n) {
    return Number(n.toPrecision(10)).toString();
}

function buildSteps(expression) {
    const stack = new Stack();
    const history = [];
    const operators = ["+", "-", "*", "/"];
    const input = expression.trim();

    if (!input) throw Error("Please enter an expression.");

    const parts = input.split(/\s+/);

    for (let i = 0; i < parts.length; i++) {
        const token = parts[i];
        let action = "";
        let left = "—";
        let right = "—";

        try {
            if (/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(token)) {
                const value = Number(token);
                if (!Number.isFinite(value)) throw Error("Invalid number.");
                stack.push(value);
                action = `Push ${fmt(value)}`;
            } else if (operators.includes(token)) {
                if (stack.size < 2) {
                    throw Error(`Insufficient operands for "${token}".`);
                }

                const b = stack.pop();
                const a = stack.pop();

                left = fmt(a);
                right = fmt(b);

                let result;

                if (token === "+") result = a + b;
                else if (token === "-") result = a - b;
                else if (token === "*") result = a * b;
                else {
                    if (b === 0) throw Error("Division by zero.");
                    result = a / b;
                }

                if (!Number.isFinite(result)) {
                    throw Error("Result is outside the supported numeric range.");
                }

                stack.push(result);
                action = `${left} ${token} ${right} = ${fmt(result)}`;
            } else {
                throw Error(`Invalid token "${token}".`);
            }

            history.push({
                token,
                action,
                left,
                right,
                stack: stack.values(),
                error: "",
                complete: false
            });
        } catch (error) {
            history.push({
                token,
                action: "Operation failed",
                left,
                right,
                stack: stack.values(),
                error: error.message,
                complete: false
            });
            return history;
        }
    }

    if (stack.size !== 1) {
        history.push({
            token: "!",
            action: "Validation failed",
            left: "—",
            right: "—",
            stack: stack.values(),
            error: "Invalid expression: exactly one value must remain.",
            complete: false
        });
    } else {
        history[history.length - 1].complete = true;
        history[history.length - 1].answer = stack.top.data;
    }

    return history;
}

function loadExample(expression) {
    $("expression").value = expression;
    startLab();
}

function startLab() {
    position = -1;
    failed = false;
    tokens = $("expression").value.trim().split(/\s+/).filter(Boolean);

    $("result").textContent = "Result: --";
    $("finalResult").textContent = "Awaiting result...";
    $("resultDescription").textContent =
        "Complete the expression to reveal the final value.";
    $("message").className = "message";

    try {
        steps = buildSteps($("expression").value);
        renderTokens();
        $("previousButton").disabled = true;
        $("nextButton").disabled = false;
        $("stepCounter").textContent = `0 / ${tokens.length} TOKENS`;
        $("message").textContent = "Expression loaded. Start stepping through.";
        $("operation").textContent = "Ready to execute";
        $("traceTitle").textContent = "Ready to start";
        $("traceDescription").textContent =
            "Use Next Step to process the first token.";
        $("actionValue").textContent = "Waiting";
        $("leftOperand").textContent = "—";
        $("rightOperand").textContent = "—";
        $("stackSize").textContent = "0";
        $("pointerValue").textContent = "None";
        $("stackCanvas").innerHTML =
            '<div class="empty-state"><div class="empty-icon">⌘</div>' +
            '<h3>Stack initialized</h3><p>Take the first step to allocate a node.</p></div>';
        $("nodeCount").textContent = "0 NODES";
        $("statNodes").innerHTML = "0 <small>nodes</small>";
        $("progressBar").style.width = "0%";
        $("result").textContent = "Result: --";
    } catch (error) {
        showError(error.message);
    }
}

function renderTokens() {
    const area = $("tokens");
    area.innerHTML = "";

    tokens.forEach((token, i) => {
        const chip = document.createElement("div");
        chip.className = "token";
        if (["+", "-", "*", "/"].includes(token)) {
            chip.classList.add("operator");
        }
        if (i < position) chip.classList.add("done");
        if (i === position) chip.classList.add("active");
        chip.textContent = token;
        area.appendChild(chip);
    });
}

function renderStack(values) {
    const area = $("stackCanvas");
    area.innerHTML = "";

    if (!values.length) {
        area.innerHTML =
            '<div class="empty-state"><div class="empty-icon">∅</div>' +
            '<h3>Empty stack</h3><p>No nodes are currently stored in memory.</p></div>';
    } else {
        values.forEach((value, i) => {
            const card = document.createElement("div");
            card.className = "node-card" + (i === 0 ? " is-top" : "");

            const label = document.createElement("span");
            label.className = "node-label";
            label.textContent = i === 0 ? "STACK TOP" : "NODE";

            const number = document.createElement("strong");
            number.textContent = fmt(value);

            const pointer = document.createElement("small");
            pointer.textContent = "next → " + (i === values.length - 1 ? "None" : "node");

            card.append(label, number, pointer);
            area.appendChild(card);

            const arrow = document.createElement("span");
            arrow.className = "pointer-arrow";
            arrow.textContent = "→";
            area.appendChild(arrow);
        });

        const end = document.createElement("span");
        end.className = "null-node";
        end.textContent = "None";
        area.appendChild(end);
    }

    $("nodeCount").textContent = `${values.length} NODE${values.length === 1 ? "" : "S"}`;
    $("stackSize").textContent = values.length;
    $("statNodes").innerHTML = `${values.length} <small>nodes</small>`;
    $("pointerValue").textContent = values.length > 1 ? "Next node" : "None";
}

function showError(message) {
    failed = true;
    $("message").textContent = "⚠ " + message;
    $("message").className = "message error";
    $("traceTitle").textContent = "Execution error";
    $("traceDescription").textContent = message;
    $("finalResult").textContent = "Expression invalid";
    $("resultDescription").textContent = message;
    $("result").textContent = "Result: Error";
    $("nextButton").disabled = true;
}

function nextStep() {
    if (failed || position >= steps.length - 1) return;

    position++;
    const step = steps[position];

    renderTokens();
    renderStack(step.stack);

    $("stepCounter").textContent =
        `${Math.min(position + 1, tokens.length)} / ${tokens.length} TOKENS`;

    $("progressBar").style.width =
        `${Math.min(100, (position + 1) / tokens.length * 100)}%`;

    $("traceTitle").textContent = step.error
        ? "Operation failed"
        : step.action;

    $("traceDescription").textContent = step.error
        ? step.error
        : ["+", "-", "*", "/"].includes(step.token)
            ? "The right operand is popped first, then the left operand. The result is pushed back onto the stack."
            : "A new linked-list node is allocated and placed at the top of the stack.";

    $("operation").textContent = "Operation: " + step.action;
    $("actionValue").textContent = step.error ? "Error" :
        ["+", "-", "*", "/"].includes(step.token) ? "Pop → Calculate → Push" : "Push";

    $("leftOperand").textContent = step.left;
    $("rightOperand").textContent = step.right;

    if (step.error) {
        showError(step.error);
        $("previousButton").disabled = position <= 0;
        return;
    }

    $("message").className = "message";
    $("message").textContent = "✓ " + step.action;

    if (step.complete) {
        const answer = fmt(step.answer);
        $("finalResult").textContent = answer;
        $("resultDescription").textContent =
            "All tokens processed successfully. One value remains on the stack.";
        $("result").textContent = "Result: " + answer;
        $("message").textContent = "✓ Evaluation completed successfully!";
        $("traceTitle").textContent = "Evaluation complete";
        $("traceDescription").textContent =
            "The stack contains exactly one value: the final result.";
    } else {
        $("finalResult").textContent = "In progress...";
        $("resultDescription").textContent =
            "Continue to process the remaining tokens.";
        $("result").textContent = "Result: --";
    }

    $("previousButton").disabled = position <= 0;
    $("nextButton").disabled = position >= steps.length - 1;
}

function previousStep() {
    if (position <= 0) return;

    position--;
    failed = false;

    const step = steps[position];

    renderTokens();
    renderStack(step.stack);

    $("stepCounter").textContent =
        `${Math.min(position + 1, tokens.length)} / ${tokens.length} TOKENS`;

    $("progressBar").style.width =
        `${Math.min(100, (position + 1) / tokens.length * 100)}%`;

    $("traceTitle").textContent = step.action;
    $("traceDescription").textContent = "Viewing a previous execution state.";
    $("operation").textContent = "Operation: " + step.action;
    $("actionValue").textContent = step.action.startsWith("Push")
        ? "Push" : "Pop → Calculate → Push";
    $("leftOperand").textContent = step.left;
    $("rightOperand").textContent = step.right;
    $("message").className = "message";
    $("message").textContent = "Viewing step " + (position + 1) + ".";

    $("finalResult").textContent = "In progress...";
    $("resultDescription").textContent =
        "Continue to process the remaining tokens.";
    $("result").textContent = "Result: --";

    $("previousButton").disabled = position <= 0;
    $("nextButton").disabled = false;
}

function resetLab() {
    steps = [];
    tokens = [];
    position = -1;
    failed = false;

    $("tokens").innerHTML = '<span class="empty-hint">Your tokens will appear here.</span>';
    $("stackCanvas").innerHTML =
        '<div class="empty-state"><div class="empty-icon">⌘</div>' +
        '<h3>Waiting for execution</h3>' +
        '<p>Run your expression to see nodes appear in memory.</p></div>';

    $("stepCounter").textContent = "READY TO BEGIN";
    $("progressBar").style.width = "0%";
    $("operation").textContent = "Operation: Waiting...";
    $("traceTitle").textContent = "Ready to start";
    $("traceDescription").textContent = "Press Evaluate to begin stepping through the expression.";
    $("actionValue").textContent = "Waiting";
    $("leftOperand").textContent = "—";
    $("rightOperand").textContent = "—";
    $("stackSize").textContent = "0";
    $("pointerValue").textContent = "None";
    $("nodeCount").textContent = "0 NODES";
    $("statNodes").innerHTML = '0 <small>nodes</small>';
    $("message").textContent = "Ready when you are.";
    $("message").className = "message";
    $("finalResult").textContent = "Awaiting result...";
    $("resultDescription").textContent = "Complete the expression to reveal the final value.";
    $("result").textContent = "Result: --";
    $("previousButton").disabled = true;
    $("nextButton").disabled = true;
}

$("expression").addEventListener("keydown", event => {
    if (event.key === "Enter") startLab();
});

startLab();
