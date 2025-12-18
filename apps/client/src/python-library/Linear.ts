export const Linear = 
    "class Linear:\n" +
    "    def __init__(self, fan_in, fan_out):\n" +
    "        self.weight = torch.randn(fan_in, fan_out) / fan_in ** 0.5\n" +
    "        self.bias = torch.randn(fan_out)\n" +
    "\n" +
    "    def __call__(self, x):\n" +
    "        self.out = x @ self.weight\n" +
    "        if self.bias is not None:\n" +
    "            self.out += self.bias\n" +
    "        return self.out\n"