
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class Stack:
    def __init__(self):
        self.top = None

    def push(self, x):
        n = Node(x)
        n.next = self.top
        self.top = n

    def pop(self):
        if not self.top:
            raise ValueError("Insufficient operands")
        x = self.top.data
        self.top = self.top.next
        return x

s = Stack()

try:
    for t in "8 3 - 2 4 * + 6 /".split():
        if t in "+-*/":
            b, a = s.pop(), s.pop()
            if t == "+": r = a + b
            elif t == "-": r = a - b
            elif t == "*": r = a * b
            else:
                if b == 0:
                    raise ValueError("Division by zero")
                r = a / b
            s.push(r)
        else:
            s.push(float(t))

    if not s.top or s.top.next:
        raise ValueError("Invalid expression")

    print("Result:", s.pop())

except ValueError as e:
    print("Error:", e)
