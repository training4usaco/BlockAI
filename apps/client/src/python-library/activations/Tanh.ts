export const Tanh = 
    "class Tanh:\n" +
    "    def __call__(self, x):\n" +
    "        self.out = torch.tanh(x)\n" +
    "        return self.out\n" +
    "\n" +
    "    def parameters(self):\n" +
    "        return []\n"